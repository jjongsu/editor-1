import { ConstText, Counter } from './components';

export default function MobX() {
	return (
		<div>
			<div>MobX test page</div>
			<div>
				<div>Counter Component</div>
				<Counter />
			</div>
			<div>
				<div>view</div>
				<ConstText />
			</div>
		</div>
	);
}
