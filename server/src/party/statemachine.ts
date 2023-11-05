export enum PartyState {
  New = 'new',
  Started = 'started',
  Finished = 'finished',
  Cancelled = 'cancelled',
}

export enum AttendeeState {
  NoAttendee = 'NoAttendee',
  ClaimForAttend = 'ClaimForAttend',
  RejectedAttendee = 'RejectedAttendee',
  FreeAttendee = 'FreeAttendee',
  WaitPayment = 'WaitPayment',
  PaidAttendee = 'PaidAttendee',
}

export class PartyStateMachine {
  private state: PartyState;
  private transitions: Map<PartyState, PartyState[]>;

  constructor(initialState: PartyState) {
    this.state = initialState;

    this.transitions = new Map();
    this.transitions.set(PartyState.New, [
      PartyState.New,
      PartyState.Started,
      PartyState.Cancelled,
    ]);
    this.transitions.set(PartyState.Started, [
      PartyState.Finished,
      PartyState.Cancelled,
    ]);
  }

  switch(state: PartyState): boolean {
    if (
      this.transitions.has(this.state) &&
      this.transitions.get(this.state).includes(state)
    ) {
      this.state = state;
      return true;
    }
    return false;
  }

  public get State(): PartyState {
    return this.state;
  }
}

export class FreeAttendeeStateMachine {
  private state: AttendeeState;
  protected transitions: Map<AttendeeState, AttendeeState[]>;

  constructor(initialState: AttendeeState) {
    this.state = initialState;

    this.transitions = new Map();
    this.transitions.set(AttendeeState.NoAttendee, [
      AttendeeState.ClaimForAttend,
      AttendeeState.FreeAttendee,
    ]);
  }

  public get State(): AttendeeState {
    return this.state;
  }

  switch(state: AttendeeState): boolean {
    if (
      this.transitions.has(this.state) &&
      this.transitions.get(this.state).includes(state)
    ) {
      this.state = state;
      return true;
    }
    return false;
  }
}

export class PaidAttendeeStateMachine extends FreeAttendeeStateMachine {
  constructor(initialState: AttendeeState) {
    super(initialState);

    this.transitions.clear(); // todo??
    this.transitions.set(AttendeeState.NoAttendee, [
      AttendeeState.ClaimForAttend,
      AttendeeState.FreeAttendee,
    ]);
  }
}
