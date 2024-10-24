import {
  BadRequestException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Controller, HttpCode } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation.pipe";
import { FetchBudgetMovimentationByProjectUseCase } from "src/domain/material-movimentation/application/use-cases/movimentation/fetch-budget-movimentations-by-project";
import { ResourceNotFoundError } from "src/domain/material-movimentation/application/use-cases/errors/resource-not-found-error";
import { MovimentationWithDetailsPresenter } from "src/infra/http/presenters/movimentation-with-details-presenter";
import { BudgetWithDetailsPresenter } from "src/infra/http/presenters/budget-with-details";
import { ApiTags } from "@nestjs/swagger";
import { UserPayload } from "src/infra/auth/jwt-strategy.guard";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { FetchBudgetMovimentationByProjectDecorator } from "src/infra/http/swagger dto and decorators/material-movimentation/movimentation/response decorators/fetch-budget-movimentations-by-project.decorator";
import { FetchBudgetMovimentationByProjectQueryDto } from "src/infra/http/swagger dto and decorators/material-movimentation/movimentation/dto classes/fetch-budget-movimentations-by-project.dto";
import { FetchPhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/fetch-physical-document";
import { PhysicalDocumentWithProjectPresenter } from "src/infra/http/presenters/physical-document-with-project-presenter";
import { GetProjectByProjectNumberUseCase } from "src/domain/material-movimentation/application/use-cases/project/get-project-by-project_number";
import { ProjectPresenter } from "src/infra/http/presenters/preject-presenter";
import { RoleAuth } from "src/infra/auth/role-auth.decorator";
import { UseCases } from "src/core/role-authorization/use-cases.enum";

const fetchBudgetMovimentationByProjectQuerySchema = z.object({
  project_number: z.string(),
  physicalDocument: z.string().optional().transform(Boolean),
  projectIn: z.string().optional(),
});

@ApiTags("movimentation")
@Controller("/movimentations-budgets")
export class FetchBudgetMovimentationByProjectController {
  constructor(
    private fetchBudgetMovimentationByProjec: FetchBudgetMovimentationByProjectUseCase,
    private fetchPhysicalDocument: FetchPhysicalDocumentUseCase,
    private getProjectByProjectNumber: GetProjectByProjectNumberUseCase
  ) {}

  @Get()
  @HttpCode(200)
  @FetchBudgetMovimentationByProjectDecorator()
  @RoleAuth(UseCases.FetchBudgetMovimentationByProjectUseCase)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(fetchBudgetMovimentationByProjectQuerySchema))
    query: FetchBudgetMovimentationByProjectQueryDto
  ) {
    let physicalDocumentSearch;
    let projectSearch;
    const { project_number, physicalDocument, projectIn } = query;

    const result = await this.fetchBudgetMovimentationByProjec.execute({
      project_number,
      baseId: user.baseId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    const movimentations = result.value.movimentations;
    const budgets = result.value.budgets;

    if (physicalDocument) {
      const resultPhysicalDocument = await this.fetchPhysicalDocument.execute({
        page: 1,
        baseId: user.baseId,
        project_number,
      });

      if (resultPhysicalDocument.isLeft()) {
        physicalDocumentSearch = undefined;
      } else {
        physicalDocumentSearch = PhysicalDocumentWithProjectPresenter.toHTTP(
          resultPhysicalDocument.value.physicalDocuments[0]
        );
      }
    }

    if (projectIn) {
      const resultProjectIn = await this.getProjectByProjectNumber.execute({
        project_number: projectIn,
        contractId: user.contractId,
      });

      if (resultProjectIn.isLeft()) {
        const error = resultProjectIn.value;

        switch (error.constructor) {
          case ResourceNotFoundError:
            throw new NotFoundException(error.message);
          default:
            throw new BadRequestException();
        }
      }

      projectSearch = ProjectPresenter.toHTTP(resultProjectIn.value.project);
    }

    return {
      movimentations: movimentations.map(
        MovimentationWithDetailsPresenter.toHTTP
      ),
      budgets: budgets.map(BudgetWithDetailsPresenter.toHTTP),
      physicalDocumentSearch,
      projectSearch,
    };
  }
}
