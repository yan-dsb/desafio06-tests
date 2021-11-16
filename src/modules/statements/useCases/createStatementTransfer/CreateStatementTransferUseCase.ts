import { inject, injectable } from "tsyringe";
import { OperationType } from "../../../../utils/operationType";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementTransferError } from "./CreateStatementTransferError";

interface IRequest {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
}

@injectable()
class CreateStatementTransferUseCase {

  constructor(
    @inject('UsersRepository') private usersRepository: IUsersRepository,
    @inject('StatementsRepository') private statementsRepository: IStatementsRepository
  ){

  }

  async execute({ sender_id, receiver_id, amount, description }: IRequest): Promise<Statement>{

    const userReceiver = await this.usersRepository.findById(receiver_id);

    if(!userReceiver){
      throw new CreateStatementTransferError.UserNotFound();
    }

    const { balance: senderBalance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if(senderBalance < amount ){
      throw new CreateStatementTransferError.InsufficientFunds();
    }

    const statement = await this.statementsRepository.create({
      amount,
      sender_id,
      user_id: userReceiver.id as string,
      description,
      type: OperationType.TRANSFER
    })


    return statement;
  }

}

export { CreateStatementTransferUseCase };
