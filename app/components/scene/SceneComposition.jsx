"use client";

import { useThree } from "@react-three/fiber";
import { useAuth } from "@/context/AuthContext";
import { useScroll } from "@/context/ScrollContext";
import { useScene } from "@/context/SceneContext";
import SceneLighting from "./SceneLighting";
import SceneBackground from "./SceneBackground";
import SceneDebugHelpers from "./SceneDebugHelpers";
import HeroSection from "./HeroSection";
import WelcomeSection from "./WelcomeSection";
import MeetTiaSection from "./MeetTiaSection";
import GirlModelSection from "./GirlModelSection";
import SceneCamera from "./SceneCamera";
import SceneShadowSetup from "./SceneShadowSetup";
import CameraController from "./CameraController";
import SceneSpotlight from "./SceneSpotlight";
import useSceneAnimationSprings from "./SceneAnimationSprings";
import { useGroupPositionUpdate } from "@/hooks/useGroupPositionUpdate";
import NoiseEffect from "../effects/NoiseEffect";
import MouseFollowCamera from "./MouseFollowCamera";
import { Sparkles } from "@react-three/drei";

const SceneComposition = () => {
  const { userRole } = useAuth();
  const {
    heroProgress,
    welcomeProgress,
    mentorProgress,
    meetTiaProgress,
    comingSoonProgress,
  } = useScroll();
  const { scene, gl } = useThree();
  
  const {
    cameraRef,
    groupRef,
    spotlightRef,
    spotlightTargetRef,
    isWallTransitioned,
    isExplorationMode,
    handleCameraStateChange
  } = useScene();

  // Get all animation springs from the custom hook
  const springs = useSceneAnimationSprings(
    { heroProgress, welcomeProgress, mentorProgress, meetTiaProgress },
    isWallTransitioned
  );
  
  // Destructure the setIsMeetTiaCloseup function and isMeetTiaCloseup state from springs
  const { setIsMeetTiaCloseup, isMeetTiaCloseup } = springs;

  // Update group position based on scroll
  useGroupPositionUpdate(groupRef, heroProgress, comingSoonProgress);

  return (
    <>
        {/* Sparkles effect for magical atmosphere */}
        <Sparkles 
        count={500} 
        scale={20} 
        size={1} 
        speed={0.3} 
        opacity={0.5}
        color="#B4D45A" 
      />
      {/* Apply noise effect to the entire scene except characters */}
      <NoiseEffect intensity={0} scale={10.0} />
      
      <SceneShadowSetup gl={gl} />
      <SceneCamera ref={cameraRef} position={[0, 0, 5]} />
      <MouseFollowCamera 
        intensity={0.40} 
        rotationIntensity={0.15} 
        smoothing={15} 
        enabled={!isExplorationMode && !isMeetTiaCloseup && mentorProgress <= 0.7} 
      />
      
      <CameraController
        cameraRef={cameraRef}
        groupRef={groupRef}
        spotlightRef={spotlightRef}
        spotlightTargetRef={spotlightTargetRef}
        userRole={userRole}
        scrollProgress={{
          heroProgress,
          welcomeProgress,
          mentorProgress,
          meetTiaProgress,
          comingSoonProgress
        }}
        onCameraStateChange={handleCameraStateChange}
        updatePortalCloseupState={setIsMeetTiaCloseup} // Pass the setter function to CameraController with renamed prop
      />
      
      <SceneSpotlight isExplorationMode={isExplorationMode} />

      <SceneLighting showHelpers={isExplorationMode} groupRef={groupRef} />
      <SceneBackground
        scene={scene}
        heroProgress={heroProgress}
        welcomeProgress={welcomeProgress}
        mentorProgress={mentorProgress}
        meetTiaProgress={meetTiaProgress}
      />

      <SceneDebugHelpers 
        isExplorationMode={isExplorationMode} 
        userRole={userRole} 
        spotlightRef={spotlightRef} 
      />

      <group position={[0, 0, 0]}>
        <HeroSection 
          heroSpring={springs.heroSpring} 
          isExplorationMode={isExplorationMode} 
        />
      </group>

      <WelcomeSection 
        welcomementorSpring={springs.welcomementorSpring} 
        isExplorationMode={isExplorationMode} 
      />

      <MeetTiaSection 
        meetTiaSpring={springs.meetTiaSpring} 
        tiaPortalSpring={springs.tiaPortalSpring}
        isExplorationMode={isExplorationMode} 
      />

      <group ref={groupRef}>
        <GirlModelSection 
          girlModelSpring={springs.girlModelSpring} 
          isExplorationMode={isExplorationMode} 
        />
      </group>
    </>
  );
};

export default SceneComposition;
