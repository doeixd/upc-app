import { createSignal, createContext, useContext, JSX, ParentComponent } from "solid-js";
import { useBeforeLeave, Router, RouterProps, BeforeLeaveEventArgs } from "@solidjs/router";

interface PreviousState {
  state: any;
  from: string;
}

type PreviousStateContextType = () => PreviousState;

export const PreviousStateContext = createContext<PreviousStateContextType>(() => ({ state: null, from: '' }));

/**
 * Creates a hook and components for managing previous route state.
 * @param {function} customStateExtractor - Optional function to customize what gets stored in the previous state.
 * @returns {[() => PreviousState, ParentComponent, ParentComponent<RouterProps>]} 
 */
export function createUsePreviousState(
  customStateExtractor?: (e: BeforeLeaveEventArgs) => PreviousState
) {
  const [previousState, setPreviousState] = createSignal<PreviousState>({ state: null, from: '' });

  const PreviousStateProvider: ParentComponent = (props) => {
    useBeforeLeave((e: BeforeLeaveEventArgs) => {
      try {
        if (customStateExtractor) {
          setPreviousState(customStateExtractor(e));
        } else {
          setPreviousState({
            state: e.from.state,
            from: e.from.pathname,
            e,
          });
        }
      } catch (error) {
        console.error("Error setting previous state:", error);
      }
    });

    return (
      <PreviousStateContext.Provider value={previousState}>
        {props.children}
      </PreviousStateContext.Provider>
    );
  };

  const EnhancedRouter: ParentComponent<RouterProps> = (props) => (
    <Router {...props}>
      <PreviousStateProvider>
        {props.children}
      </PreviousStateProvider>
    </Router>
  );

  const usePreviousState = () => useContext(PreviousStateContext);

  return [usePreviousState, PreviousStateProvider, EnhancedRouter] as const;
}