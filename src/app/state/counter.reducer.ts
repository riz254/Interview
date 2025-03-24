import { createReducer, on } from '@ngrx/store';
import { increment, decrement, reset } from './counter.actions';

// Initial State
export const initialState = 0;

// Reducer Function
export const counterReducer = createReducer(
  initialState,
  on(increment, (state) => state + 1),
  on(decrement, (state) => state - 1),
  on(reset, () => initialState)
);
