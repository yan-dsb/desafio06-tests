import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { CreateStatementTransferUseCase } from './CreateStatementTransferUseCase';

class CreateStatementTransferController {

  async execute(request: Request, response: Response): Promise<Response> {

    const { user_id: receiver_id } = request.params;
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;

    const createStatementTransferUseCase = container.resolve(CreateStatementTransferUseCase);

    const statementTransfer = await createStatementTransferUseCase.execute({ sender_id, receiver_id, amount, description });


    return response.json(statementTransfer);
  }

}

export { CreateStatementTransferController };
