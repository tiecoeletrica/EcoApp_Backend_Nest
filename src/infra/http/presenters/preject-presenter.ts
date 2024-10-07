import { Project } from "src/domain/material-movimentation/enterprise/entities/project";

export class ProjectPresenter {
  static toHTTP(project: Project) {
    return {
      id: project.id.toString(),
      baseId: project.baseId.toString(),
      project_number: project.project_number,
      type: project.type,
      city: project.city,
      description: project.description,
    };
  }
}
