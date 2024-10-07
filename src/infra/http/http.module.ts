import { Module } from "@nestjs/common";
import { DtoModule } from "./swagger dto and decorators/dto.module";
import { CryptographyModule } from "../cryptography/cryptography.module";
import { DatabaseModule } from "../database/database.module";
import { CreateAccountController } from "./controllers/material-movimentation/users/create-account.controller";
import { AuthenticateController } from "./controllers/material-movimentation/users/authenticate.controller";
import { CreateMaterialController } from "./controllers/material-movimentation/material/create-material.controller";
import { FetchMaterialController } from "./controllers/material-movimentation/material/fetch-materials.controller";
import { CreateMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/material/create-material";
import { FetchMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/material/fetch-material";
import { AuthenticateUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/authenticate-user";
import { GetAccountByidController } from "./controllers/material-movimentation/users/get-account-by-id.controller";
import { EditAccountController } from "./controllers/material-movimentation/users/edit-account.controller";
import { DeleteAccountController } from "./controllers/material-movimentation/users/delete-account.controller";
import { FetchAccountsController } from "./controllers/material-movimentation/users/fetch-accounts.controller";
import { RegisterContractController } from "./controllers/material-movimentation/contract-base/register-contract.controller";
import { RegisterContractUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/register-contract";
import { FetchContractController } from "./controllers/material-movimentation/contract-base/fetch-contracts.controller";
import { FetchContractUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/fetch-contract";
import { RegisterBaseUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/register-base";
import { RegisterBaseController } from "./controllers/material-movimentation/contract-base/register-base.controller";
import { FetchBaseController } from "./controllers/material-movimentation/contract-base/fetch-base.controller";
import { FetchBaseUseCase } from "src/domain/material-movimentation/application/use-cases/contract-base/fetch-base";
import { IdentifierAttributionUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/identifier-attribution";
import { IdentifierAttributionController } from "./controllers/material-movimentation/physicalDocument/identifier-attribution.controller";
import { FetchPhysicalDocumentsController } from "./controllers/material-movimentation/physicalDocument/fetch-physical-document.controller";
import { FetchPhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/fetch-physical-document";
import { UnitizePhysicalDocumentController } from "./controllers/material-movimentation/physicalDocument/unitize-physical-document.controller";
import { UnitizePhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/unitize-physical-document";
import { DeletePhysicalDocumentController } from "./controllers/material-movimentation/physicalDocument/delete-physical-document..controller";
import { DeletePhysicalDocumentUseCase } from "src/domain/material-movimentation/application/use-cases/physicalDocument/delete-physical-document";
import { TransferMaterialController } from "./controllers/material-movimentation/project-movimentation-budget/transfer-material.controller";
import { TransferMaterialUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/transfer-material";
import { RegisterProjectUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/register-project";
import { RegisterProjectController } from "./controllers/material-movimentation/project-movimentation-budget/register-project.controller";
import { TransferMovimentationBetweenProjectsController } from "./controllers/material-movimentation/project-movimentation-budget/transfer-movimentation-between-projects.controller";
import { TransferMovimentationBetweenProjectsUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/transfer-movimentation-between-projects";
import { FetchMovimentationHistoryController } from "./controllers/material-movimentation/project-movimentation-budget/fetch-movimentations-history.controller";
import { FetchMovimentationHistoryUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/fetch-movimentations-history";
import { FetchBudgetMovimentationByProjectController } from "./controllers/material-movimentation/project-movimentation-budget/fetch-budget-movimentations-by-project.controller";
import { FetchBudgetMovimentationByProjectUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/fetch-budget-movimentations-by-project";
import { FetchBudgetByProjectNameController } from "./controllers/material-movimentation/project-movimentation-budget/fetch-budget-by-project-name.controller";
import { FetchBudgetByProjectNameUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/fetch-budget-by-project-name";
import { GetProjectByProjectNumberController } from "./controllers/material-movimentation/project-movimentation-budget/get-project-by-project_number.controller";
import { GetProjectByProjectNumberUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/get-project-by-project_number";
import { RegisterBudgetController } from "./controllers/material-movimentation/project-movimentation-budget/register-budget.controller";
import { RegisterBudgetUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/register-budget";
import { GetUserByIdUseCase } from "src/domain/material-movimentation/application/use-cases/users/get-user-by-id";
import { FetchUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/fetch-user";
import { EditUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/edit-user";
import { DeleteUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/delete-user";
import { RegisterUserUseCase } from "src/domain/material-movimentation/application/use-cases/users/register-user";
import { EditBudgetController } from "./controllers/material-movimentation/project-movimentation-budget/edit-budget.controller";
import { EditBudgetUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/edit-budget";
import { FetchOnlyProjectsOfBudgetsUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/fetch-only-projects-of-budgets";
import { FetchOnlyProjectsOfBudgetController } from "./controllers/material-movimentation/project-movimentation-budget/fetch-only-projects-of-budgets.controller";
import { FetchExistingBudgetByProjectsUseCase } from "src/domain/material-movimentation/application/use-cases/project-movimentation-budget/fetch-existing-budgets-by-projects";
import { FetchExistingBudgetByProjectsController } from "./controllers/material-movimentation/project-movimentation-budget/fetch-existing-budgets-by-projects.controller";

@Module({
  imports: [DatabaseModule, CryptographyModule, DtoModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateMaterialController,
    FetchMaterialController,
    GetAccountByidController,
    EditAccountController,
    DeleteAccountController,
    FetchAccountsController,
    RegisterContractController,
    FetchContractController,
    RegisterBaseController,
    FetchBaseController,
    IdentifierAttributionController,
    FetchPhysicalDocumentsController,
    UnitizePhysicalDocumentController,
    DeletePhysicalDocumentController,
    TransferMaterialController,
    RegisterProjectController,
    TransferMovimentationBetweenProjectsController,
    FetchMovimentationHistoryController,
    FetchBudgetMovimentationByProjectController,
    FetchBudgetByProjectNameController,
    GetProjectByProjectNumberController,
    RegisterBudgetController,
    EditBudgetController,
    FetchOnlyProjectsOfBudgetController,
    FetchExistingBudgetByProjectsController,
  ],
  providers: [
    CreateMaterialUseCase,
    FetchMaterialUseCase,
    AuthenticateUserUseCase,
    RegisterUserUseCase,
    GetUserByIdUseCase,
    EditUserUseCase,
    DeleteUserUseCase,
    FetchUserUseCase,
    RegisterContractUseCase,
    FetchContractUseCase,
    RegisterBaseUseCase,
    FetchBaseUseCase,
    IdentifierAttributionUseCase,
    FetchPhysicalDocumentUseCase,
    UnitizePhysicalDocumentUseCase,
    DeletePhysicalDocumentUseCase,
    TransferMaterialUseCase,
    RegisterProjectUseCase,
    TransferMovimentationBetweenProjectsUseCase,
    FetchMovimentationHistoryUseCase,
    FetchBudgetMovimentationByProjectUseCase,
    FetchBudgetByProjectNameUseCase,
    GetProjectByProjectNumberUseCase,
    RegisterBudgetUseCase,
    EditBudgetUseCase,
    FetchOnlyProjectsOfBudgetsUseCase,
    FetchExistingBudgetByProjectsUseCase,
  ],
})
export class HttpModule {}
