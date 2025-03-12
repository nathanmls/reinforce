"use client";

import { forwardRef, useImperativeHandle } from "react";
import { SceneProvider, useScene } from "@/context/SceneContext";
import SceneComposition from "./scene/SceneComposition";
import { TRANSITION_STATES } from './scene/CameraController';

const HomeMainSceneInner = forwardRef((props, ref) => {
  const {
    transitionWallMeetTia,
    reverseWallMeetTiaTransition,
    getTransitionState,
    transitionToMeetTiaCloseup,
    transitionToMeetTiaInitial,
    isMeetTiaCloseup
  } = useScene();

  // Expose transition methods through ref
  useImperativeHandle(
    ref,
    () => ({
      transitionWallMeetTia: () => {
        if (transitionWallMeetTia.current) {
          transitionWallMeetTia.current();
        }
      },
      reverseWallMeetTiaTransition: () => {
        if (reverseWallMeetTiaTransition.current) {
          reverseWallMeetTiaTransition.current();
        }
      },
      getTransitionState: () => {
        if (getTransitionState.current) {
          return getTransitionState.current();
        }
        return { state: TRANSITION_STATES.IDLE, error: null };
      },
      // Add new camera transition functions
      transitionToMeetTiaCloseup: () => {
        if (transitionToMeetTiaCloseup.current) {
          transitionToMeetTiaCloseup.current();
        }
      },
      transitionToMeetTiaInitial: () => {
        if (transitionToMeetTiaInitial.current) {
          transitionToMeetTiaInitial.current();
        }
      },
      // Expose the closeup state
      isMeetTiaCloseup: isMeetTiaCloseup
    }),
    [transitionWallMeetTia, reverseWallMeetTiaTransition, getTransitionState, 
     transitionToMeetTiaCloseup, transitionToMeetTiaInitial, isMeetTiaCloseup]
  );

  return <SceneComposition />;
});

HomeMainSceneInner.displayName = "HomeMainSceneInner";

// Wrapper component that provides the SceneContext
const HomeMainScene = ({ sceneRef, ...props }) => {
  return (
    <SceneProvider>
      <HomeMainSceneInner ref={sceneRef} {...props} />
    </SceneProvider>
  );
};

HomeMainScene.displayName = "HomeMainScene";

export default HomeMainScene;
