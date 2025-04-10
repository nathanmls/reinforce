/**
 * MentorPortalModel Component
 *
 * A specific implementation of the PortalModel for generic mentor characters.
 * This component uses the reusable PortalModel with mentor-specific configurations.
 */

'use client';

import { useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types';
import PortalModel from './PortalModel';

/**
 * MentorPortalModel Component
 *
 * Renders a mentor's 3D model in the scene using the reusable PortalModel component.
 * This component provides mentor-specific defaults while allowing for customization.
 *
 * @returns {JSX.Element} A PortalModel configured for mentor characters
 */
export default function MentorPortalModel({
  mentorModelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  clone = false,
  wireframe = false,
  clippingPlanes = [],
  ...otherProps
}) {
  // Use the reusable PortalModel with mentor-specific configurations
  return (
    <PortalModel
      modelPath={mentorModelPath}
      position={position}
      rotation={rotation}
      scale={scale}
      clone={clone}
      wireframe={wireframe}
      clippingPlanes={clippingPlanes}
      // Mentor-specific material defaults - can be overridden with otherProps
      roughness={0.6}
      metalness={0.2}
      envMapIntensity={0.7}
      normalScale={1.2}
      aoMapIntensity={0.4}
      emissiveIntensity={0.5}
      {...otherProps}
    />
  );
}

MentorPortalModel.propTypes = {
  mentorModelPath: PropTypes.string.isRequired,
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

// Note: We don't preload any specific model here since the path is dynamic
