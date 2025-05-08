import { makeAutoObservable } from 'mobx';

class CounterStore {
	count: number = 0;

	constructor() {
		makeAutoObservable(this); // observable + action + computed 자동 설정
	}

	increment() {
		this.count += 1;
	}

	decrement() {
		this.count -= 1;
	}

	get isEven() {
		return this.count % 2 === 0;
	}
}

const counterStore = new CounterStore();
export default counterStore;
