import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AlterStatementsTypeAddValueAndCreateSendIDColumn1637090019377 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('statements', 'type');
    await queryRunner.addColumn('statements', new TableColumn({
      name: 'type',
      type: 'enum',
      enum: ['deposit', 'withdraw', 'transfer'],
      isNullable: true,
    }));

    await queryRunner.addColumn('statements', new TableColumn({
      name: 'sender_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.createForeignKey('statements', new TableForeignKey({
        name: 'FKSenderStatement',
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        columnNames: ['sender_id']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('statements', 'FKSenderStatement');
    await queryRunner.dropColumn('statements', 'sender_id');
    await queryRunner.dropColumn("statements", "type");
    await queryRunner.addColumn('statements', new TableColumn({
      name: 'type',
      type: 'enum',
      enum: ['deposit', 'withdraw']
    }));
  }

}
