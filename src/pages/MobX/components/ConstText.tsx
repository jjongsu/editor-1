import { useEffect } from 'react';
import counterStore from '../../../stores/counterStore';

export default function ConstText() {
	useEffect(() => {
		console.log('ConstText observe 하지 않고 있는 곳에서의 counter 현재값 : ', counterStore.count);
	}, [counterStore.count]);

	return (
		<div>
			<div>ConstText</div>
			<div>현재 카운트 : {counterStore.count}</div>
		</div>
	);
}
