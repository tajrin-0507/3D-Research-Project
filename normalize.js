/**
 * @fileoverview Normalizes loaded 3D models by scaling them to fit within one
 * world unit and centering them at the origin.
 * @author Dr. Lee Stemkoski, Maheen Naqvi
 */

AFRAME.registerComponent('normalize', {

  init: function () {

    this.el.addEventListener('model-loaded', () => {

      const root = this.el.getObject3D('mesh');

      // Determine the combined bounds of all non-skinned meshes.
      let globalMin = new THREE.Vector3( Infinity,  Infinity,  Infinity);
      let globalMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

      root.traverse(child => {

        if (child.isMesh && child.geometry && !child.isSkinnedMesh) {

          const geom = child.geometry;

          if (!geom.boundingBox) {
            geom.computeBoundingBox();
          }

          const box = geom.boundingBox;

          globalMin.min(box.min);
          globalMax.max(box.max);
        }
      });

      const size = new THREE.Vector3().subVectors(globalMax, globalMin);
      const maxDim = Math.max(size.x, size.y, size.z);
      // Fit the model's largest dimension within one world unit.
      const scaleFactor = 1.0 / maxDim;

      root.traverse(child => {

        if (child.isMesh && child.geometry && !child.isSkinnedMesh) {

          child.geometry.scale(scaleFactor, scaleFactor, scaleFactor);
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
      });

      globalMin.set( Infinity,  Infinity,  Infinity);
      globalMax.set(-Infinity, -Infinity, -Infinity);

      // Recalculate the bounds after scaling for accurate centering.
      root.traverse(child => {

        if (child.isMesh && child.geometry && !child.isSkinnedMesh) {

          const box = child.geometry.boundingBox;
          globalMin.min(box.min);
          globalMax.max(box.max);
        }
      });

      const center = new THREE.Vector3()
        .addVectors(globalMin, globalMax)
        .multiplyScalar(0.5);

      // Translate each mesh so the model is centered at the origin.
      root.traverse(child => {

        if (child.isMesh && child.geometry && !child.isSkinnedMesh) {

          child.geometry.translate(-center.x, -center.y, -center.z);
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
          child.geometry.computeVertexNormals();
        }
      });

    });

  }

});