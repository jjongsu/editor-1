import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MobX from './pages/MobX';
import Zustand from './pages/Zustand';
import PMEditor from './pages/PMEditor';
import Test1 from './pages/Test1';
import Test2 from './pages/Test2';
import Test3 from './pages/Test3';
import Test4 from './pages/Test4';
import Test5 from './pages/Test5';
import Test6 from './pages/Test6';
import Test7 from './pages/Test7';
import Test8 from './pages/Test8';
import Test9 from './pages/Test9';
import Test10 from './pages/Test10';

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
		path: '/test5',
		element: <Test5 />,
	},
	{
		path: '/test6',
		element: <Test6 />,
	},
	{
		path: '/test7',
		element: <Test7 />,
	},
	{
		path: '/test8',
		element: <Test8 />,
	},
	{
		path: '/test9',
		element: <Test9 />,
	},
	{
		path: '/test10',
		element: <Test10 />,
	},
	{
		path: '*',
		element: <Navigate to="/zustand" />,
	},
]);

export default function Router() {
	return <RouterProvider router={router} />;
}
