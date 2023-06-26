export class Person {
	name: string;
	description: string;
	imageSource: string;
	linkedinUrl: string;
	githubUrl: string;

	constructor(name: string, description: string, imageSource: string, linkedinUrl: string, githubUrl: string) {
		this.name = name;
		this.description = description;
		this.imageSource = imageSource;
		this.linkedinUrl = linkedinUrl;
		this.githubUrl = githubUrl;
	}
}