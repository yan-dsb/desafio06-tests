import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User receiver not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}
