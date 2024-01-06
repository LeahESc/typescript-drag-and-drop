//  project type 
enum ProjectStatus { Active, Finished }

//  project type
class Project {
  constructor(
    public id: string,
    public title: string, 
    public description: string, 
    public people: number, 
    public status: ProjectStatus
  ) {}
}


//  project state class

type Listener<T> = (items: T[]) => void; 

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super()
  }

  static getInstance() {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ProjectState();
    return this.instance
  }

  

  addProject(title: string, description: string, numberOfPeople: number) {
    const newProject = new Project (
      Math.random().toString(),
      title,
      description,
      numberOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable): boolean => {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid &&  validatableInput.value.toString().trim().length !== 0
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }

  return isValid
}

// autobind decorator
const autoBind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
};

// component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement; 
  hostElement: T; 
  element: U;
  
  constructor(
    templateId: string, 
    hostElementId: string, 
    insertAtStart: boolean,
    newElementId?: string 
    ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    newElementId ? this.element.id = newElementId : this.element.id = null;
    this.attach(insertAtStart)
  }


  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// project list class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
  
    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLElement
    listEl.innerHTML = ''
    this.assignedProjects.forEach(project => {
      const listItem = document.createElement('li')
      listItem.textContent = project.title
      listEl?.appendChild(listItem)
    })
  }

  configure () {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active
        } else {
          return prj.status === ProjectStatus.Finished
        }
      })
  
      this.assignedProjects = relevantProjects
      this.renderProjects()
    })
  };
  
  renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId

    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS'
  }
}
// project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input')
    this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInput = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInput = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  // private inputEmpty(): boolean {
  //   const inputArray = [
  //     this.titleInput.value,
  //     this.descriptionInput.value,
  //     this.peopleInput.value
  //   ]
  //   return inputArray.some(element => element.length === 0) ? true : false
  // }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInput.value;
    const enteredDescription = this.descriptionInput.value;
    const enteredPeople = this.peopleInput.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
      minLength: 3,
      maxLength: 12
    }

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 3,
      maxLength: 30
    }

    const peopleValidatable: Validatable = {
      value: enteredPeople,
      required: true,
      min: 1,
      max: 5
    }

    if (
      !validate(titleValidatable) || 
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople]
    }
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {};

  private clearInputs() {
    this.titleInput.value = ''
    this.descriptionInput.value = ''
    this.peopleInput.value = ''
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInput.value);
    const input = this.gatherUserInput()
    if (Array.isArray(input)) {
      const [title, description, people] = input
      projectState.addProject(title, description, people)
      this.clearInputs()
    }
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active'); 
const finishedProjectList = new ProjectList('finished'); 

