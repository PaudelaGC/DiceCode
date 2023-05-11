export class User {
  constructor(name) {
    this.name = name;
    this.id = 0;
    this.results = [];
    this.winrate = 0;
    this.createdAt = new Date().toString();
  }
}
