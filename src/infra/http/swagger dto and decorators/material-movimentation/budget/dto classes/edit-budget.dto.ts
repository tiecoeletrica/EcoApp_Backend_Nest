import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class UpdatedBudgetDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the existing budget to be updated',
  })
  budgetId!: string;

  @ApiProperty({
    example: 100.50,
    description: 'New value for the budget',
  })
  value!: number;
}

class NewBudgetDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the material for the new budget',
  })
  materialId!: string;

  @ApiProperty({
    example: 150.75,
    description: 'Value for the new budget',
  })
  value!: number;
}

@Injectable()
export class EditBudgetBodyDto {
  @ApiProperty({
    type: [UpdatedBudgetDto],
    description: 'Array of budgets to be updated',
  })
  updatedBudgets!: UpdatedBudgetDto[];

  @ApiProperty({
    type: [NewBudgetDto],
    description: 'Array of new budgets to be added',
  })
  newBudgets!: NewBudgetDto[];
}