import {
  AttendeeState,
  FreeAttendeeStateMachine,
  PartyState,
  PartyStateMachine,
} from './statemachine';

describe('PartyStateMachine', () => {
  it('Fails switch New -> Finished', () => {
    const sm = new PartyStateMachine(PartyState.New);
    expect(sm.switch(PartyState.Finished)).toBeFalsy();
    expect(sm.State).toBe(PartyState.New);
  });

  it('Success switch New -> Started', () => {
    const sm = new PartyStateMachine(PartyState.New);
    expect(sm.switch(PartyState.Started)).toBeTruthy();
    expect(sm.State).toBe(PartyState.Started);
  });
});

describe('FreeAttendeeStateMachine', () => {
  it('Success switch NoAttendee -> FreeAttendee', () => {
    const sm = new FreeAttendeeStateMachine(AttendeeState.NoAttendee);
    expect(sm.switch(AttendeeState.FreeAttendee)).toBeTruthy();
    expect(sm.State).toBe(AttendeeState.FreeAttendee);
  });
});
