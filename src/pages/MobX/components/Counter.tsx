import { observer } from 'mobx-react-lite';
import counterStore from '../../../stores/counterStore';

const Counter = observer(() => {
	return (
		<div>
			<h2>Count: {counterStore.count}</h2>
			<p>{counterStore.isEven ? '짝수입니다' : '홀수입니다'}</p>
			<button onClick={() => counterStore.increment()}>+</button>
			<button onClick={() => counterStore.decrement()}>-</button>
		</div>
	);
});

export default Counter;
