// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable) => {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid &&  validatableInput.value.toString().trim().length !== 0
  }
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
// project input class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    // typecasting
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInput = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInput = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }
  private inputEmpty(): boolean {
    const inputArray = [
      this.titleInput.value,
      this.descriptionInput.value,
      this.peopleInput.value
    ]
    return inputArray.some(element => element.length === 0) ? true : false
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInput.value;
    const description = this.descriptionInput.value;
    const people = this.peopleInput.value;

    if (
      this.inputEmpty()
    ) {
      alert('Invalid input');
      return;
    } else {
      return [title, description, +people]
    }
  }

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
      console.log(title, description, people)
    }
    this.clearInputs()
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const project = new ProjectInput();
