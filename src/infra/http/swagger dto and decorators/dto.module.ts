import { Module } from "@nestjs/common";
import { FetchAccountsQueryDto } from "./material-movimentation/users/dto classes/fetch-accounts.dto";
import { EditAccountBodyDto } from "./material-movimentation/users/dto classes/edit-account.dto";
import { CreateAccountBodyDto } from "./material-movimentation/users/dto classes/create-account.dto";
import { AuthenticateBodyDto } from "./material-movimentation/users/dto classes/authenticate.dto";
import { TransferMovimentationBetweenProjectsBodyDto } from "./material-movimentation/project-movimentation-budget/dto classes/transfer-movimentation-between-projects.dto";
import { TransferMaterialBodyDto } from "./material-movimentation/project-movimentation-budget/dto classes/transfer-material.dto";
import { FetchMovimentationHistoryQueryDto } from "./material-movimentation/project-movimentation-budget/dto classes/fetch-movimentations-history.dto";
import { FetchBudgetMovimentationByProjectQueryDto } from "./material-movimentation/project-movimentation-budget/dto classes/fetch-budget-movimentations-by-project.dto";
import { FetchBudgetByProjectNameQueryDto } from "./material-movimentation/project-movimentation-budget/dto classes/fetch-budget-by-project-name.dto";
import { UnitizePhysicalDocumentBodyDto } from "./material-movimentation/physicalDocument/dto classes/unitize-physical-document.dto";
import { IdentifierAttributionBodyDto } from "./material-movimentation/physicalDocument/dto classes/identifier-attribution.dto";
import { FetchPhysicalDocumentsQueryDto } from "./material-movimentation/physicalDocument/dto classes/fetch-physical-document.dto";
import { FetchMaterialQueryDto } from "./material-movimentation/material/dto classes/fetch-materials.dto";
import { CreateMaterialBodyDto } from "./material-movimentation/material/dto classes/create-material.dto";
import { RegisterContractBodyDto } from "./material-movimentation/contract-base/dto classes/register-contract.dto";
import { RegisterBaseBodyDto } from "./material-movimentation/contract-base/dto classes/register-base.dto";
import { GetProjectByProjectNumberQueryDto } from "./material-movimentation/project-movimentation-budget/dto classes/get-project-by-project_number.dto";
import { RegisterBudgetBodyDto } from "./material-movimentation/project-movimentation-budget/dto classes/register-budget.dto";
import { EditBudgetBodyDto } from "./material-movimentation/project-movimentation-budget/dto classes/edit-budget.dto";
import { FetchOnlyProjectsOfBudgetsBodyDto } from "./material-movimentation/project-movimentation-budget/dto classes/fetch-only-projects-of-budgets.dto";
import { FetchExistingBudgetByProjectsBodyDto } from "./material-movimentation/project-movimentation-budget/dto classes/fetch-existing-budgets-by-projects.dto";

@Module({
  providers: [
    FetchAccountsQueryDto,
    EditAccountBodyDto,
    CreateAccountBodyDto,
    AuthenticateBodyDto,
    TransferMovimentationBetweenProjectsBodyDto,
    TransferMaterialBodyDto,
    FetchMovimentationHistoryQueryDto,
    FetchBudgetMovimentationByProjectQueryDto,
    FetchBudgetByProjectNameQueryDto,
    UnitizePhysicalDocumentBodyDto,
    IdentifierAttributionBodyDto,
    FetchPhysicalDocumentsQueryDto,
    FetchMaterialQueryDto,
    CreateMaterialBodyDto,
    RegisterContractBodyDto,
    RegisterBaseBodyDto,
    GetProjectByProjectNumberQueryDto,
    RegisterBudgetBodyDto,
    EditBudgetBodyDto,
    FetchOnlyProjectsOfBudgetsBodyDto,
    FetchExistingBudgetByProjectsBodyDto,
  ],
  exports: [
    FetchAccountsQueryDto,
    EditAccountBodyDto,
    CreateAccountBodyDto,
    AuthenticateBodyDto,
    TransferMovimentationBetweenProjectsBodyDto,
    TransferMaterialBodyDto,
    FetchMovimentationHistoryQueryDto,
    FetchBudgetMovimentationByProjectQueryDto,
    FetchBudgetByProjectNameQueryDto,
    UnitizePhysicalDocumentBodyDto,
    IdentifierAttributionBodyDto,
    FetchPhysicalDocumentsQueryDto,
    FetchMaterialQueryDto,
    CreateMaterialBodyDto,
    RegisterContractBodyDto,
    RegisterBaseBodyDto,
    GetProjectByProjectNumberQueryDto,
    RegisterBudgetBodyDto,
    EditBudgetBodyDto,
    FetchOnlyProjectsOfBudgetsBodyDto,
    FetchExistingBudgetByProjectsBodyDto,
  ],
})
export class DtoModule {}
