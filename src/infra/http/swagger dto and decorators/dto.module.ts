import { Module } from "@nestjs/common";
import { FetchAccountsQueryDto } from "./material-movimentation/users/dto classes/fetch-accounts.dto";
import { EditAccountBodyDto } from "./material-movimentation/users/dto classes/edit-account.dto";
import { CreateAccountBodyDto } from "./material-movimentation/users/dto classes/create-account.dto";
import { AuthenticateBodyDto } from "./material-movimentation/users/dto classes/authenticate.dto";
import { TransferMovimentationBetweenProjectsBodyDto } from "./material-movimentation/movimentation/dto classes/transfer-movimentation-between-projects.dto";
import { TransferMaterialBodyDto } from "./material-movimentation/movimentation/dto classes/transfer-material.dto";
import { FetchMovimentationHistoryQueryDto } from "./material-movimentation/movimentation/dto classes/fetch-movimentations-history.dto";
import { FetchBudgetMovimentationByProjectQueryDto } from "./material-movimentation/movimentation/dto classes/fetch-budget-movimentations-by-project.dto";
import { FetchBudgetByProjectNameQueryDto } from "./material-movimentation/budget/dto classes/fetch-budget-by-project-name.dto";
import { UnitizePhysicalDocumentBodyDto } from "./material-movimentation/physicalDocument/dto classes/unitize-physical-document.dto";
import { IdentifierAttributionBodyDto } from "./material-movimentation/physicalDocument/dto classes/identifier-attribution.dto";
import { FetchPhysicalDocumentsQueryDto } from "./material-movimentation/physicalDocument/dto classes/fetch-physical-document.dto";
import { FetchMaterialQueryDto } from "./material-movimentation/material/dto classes/fetch-materials.dto";
import { CreateMaterialBodyDto } from "./material-movimentation/material/dto classes/create-material.dto";
import { RegisterContractBodyDto } from "./material-movimentation/contract-base/dto classes/register-contract.dto";
import { RegisterBaseBodyDto } from "./material-movimentation/contract-base/dto classes/register-base.dto";
import { GetProjectByProjectNumberQueryDto } from "./material-movimentation/project/dto classes/get-project-by-project_number.dto";
import { RegisterBudgetBodyDto } from "./material-movimentation/budget/dto classes/register-budget.dto";
import { EditBudgetBodyDto } from "./material-movimentation/budget/dto classes/edit-budget.dto";
import { FetchOnlyProjectsOfBudgetsBodyDto } from "./material-movimentation/budget/dto classes/fetch-only-projects-of-budgets.dto";
import { FetchExistingBudgetByProjectsBodyDto } from "./material-movimentation/budget/dto classes/fetch-existing-budgets-by-projects.dto";
import { RegisterProjectBodyDto } from "./material-movimentation/project/dto classes/register-project.dto";
import { FetchAllMaterialQueryDto } from "./material-movimentation/material/dto classes/fetch-all-materials.dto";
import { FetchAllMovimentationHistoryQueryDto } from "./material-movimentation/movimentation/dto classes/fetch-all-movimentations-history.dto";
import { FetchProjectsBudgetsByMaterialsQueryDto } from "./material-movimentation/budget/dto classes/fetch-projects-of-budgets-by-meterials.dto";
import { EditBudgetsByMaterialBodyDto } from "./material-movimentation/budget/dto classes/edit-budgets-by-material.dto";

@Module({
  providers: [
    FetchAccountsQueryDto,
    EditAccountBodyDto,
    CreateAccountBodyDto,
    AuthenticateBodyDto,
    TransferMovimentationBetweenProjectsBodyDto,
    TransferMaterialBodyDto,
    FetchMovimentationHistoryQueryDto,
    FetchAllMovimentationHistoryQueryDto,
    FetchBudgetMovimentationByProjectQueryDto,
    FetchBudgetByProjectNameQueryDto,
    UnitizePhysicalDocumentBodyDto,
    IdentifierAttributionBodyDto,
    FetchPhysicalDocumentsQueryDto,
    FetchMaterialQueryDto,
    FetchAllMaterialQueryDto,
    CreateMaterialBodyDto,
    RegisterContractBodyDto,
    RegisterBaseBodyDto,
    GetProjectByProjectNumberQueryDto,
    RegisterBudgetBodyDto,
    EditBudgetBodyDto,
    FetchOnlyProjectsOfBudgetsBodyDto,
    FetchExistingBudgetByProjectsBodyDto,
    RegisterProjectBodyDto,
    FetchProjectsBudgetsByMaterialsQueryDto,
    EditBudgetsByMaterialBodyDto,
  ],
  exports: [
    FetchAccountsQueryDto,
    EditAccountBodyDto,
    CreateAccountBodyDto,
    AuthenticateBodyDto,
    TransferMovimentationBetweenProjectsBodyDto,
    TransferMaterialBodyDto,
    FetchMovimentationHistoryQueryDto,
    FetchAllMovimentationHistoryQueryDto,
    FetchBudgetMovimentationByProjectQueryDto,
    FetchBudgetByProjectNameQueryDto,
    UnitizePhysicalDocumentBodyDto,
    IdentifierAttributionBodyDto,
    FetchPhysicalDocumentsQueryDto,
    FetchMaterialQueryDto,
    FetchAllMaterialQueryDto,
    CreateMaterialBodyDto,
    RegisterContractBodyDto,
    RegisterBaseBodyDto,
    GetProjectByProjectNumberQueryDto,
    RegisterBudgetBodyDto,
    EditBudgetBodyDto,
    FetchOnlyProjectsOfBudgetsBodyDto,
    FetchExistingBudgetByProjectsBodyDto,
    RegisterProjectBodyDto,
    FetchProjectsBudgetsByMaterialsQueryDto,
    EditBudgetsByMaterialBodyDto,
  ],
})
export class DtoModule {}
