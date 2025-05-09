import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MobX from './pages/MobX';
import Zustand from './pages/Zustand';
import PMEditor from './pages/PMEditor';
import Test1 from './pages/Test1';
import Test2 from './pages/Test2';
import Test3 from './pages/Test3';
import Test4 from './pages/Test4';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Navigate to="/zustand" />,
	},
	{
		path: '/zustand',
		element: <Zustand />,
	},
	{
		path: '/mobx',
		element: <MobX />,
	},
	{
		path: '/pm-editor',
		element: <PMEditor />,
	},
	{
		path: '/test1',
		element: <Test1 />,
	},
	{
		path: '/test2',
		element: <Test2 />,
	},
	{
		path: '/test3',
		element: <Test3 />,
	},
	{
		path: '/test4',
		element: <Test4 />,
	},
	{
		path: '*',
		element: <Navigate to="/zustand" />,
	},
]);

export default function Router() {
	return <RouterProvider router={router} />;
}
