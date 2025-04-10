/**
 * TiaPortalModel Component
 *
 * A specific implementation of the PortalModel for the Tia character.
 * This component uses the reusable PortalModel with Tia-specific configurations.
 */

'use client';

import { useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types';
import PortalModel from './PortalModel';

/**
 * TiaPortalModel Component
 *
 * Renders Tia's 3D model in the scene using the reusable PortalModel component.
 * This component provides Tia-specific defaults while allowing for customization.
 *
 * @returns {JSX.Element} A PortalModel configured for Tia character
 */
export default function TiaPortalModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.2,
  clone = false,
  wireframe = false,
  clippingPlanes = [],
  ...otherProps
}) {
  // Use the reusable PortalModel with Tia-specific configurations
  return (
    <PortalModel
      modelPath="/models/tia-rpm-fbx.fbx"
      position={position}
      rotation={rotation}
      scale={scale}
      clone={clone}
      wireframe={wireframe}
      clippingPlanes={clippingPlanes}
      roughness={0.7}
      metalness={0.1}
      envMapIntensity={0.8}
      normalScale={1.5}
      aoMapIntensity={0.5}
      emissiveIntensity={0.6}
      {...otherProps}
    />
  );
}

TiaPortalModel.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  clone: PropTypes.bool,
  wireframe: PropTypes.bool,
  clippingPlanes: PropTypes.array,
  // Additional props from PortalModel can be passed through
};

// Preload the model to improve performance
useGLTF.preload('/models/tia-rpm-fbx.fbx');
