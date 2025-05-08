import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MobX from './pages/MobX';
import Zustand from './pages/Zustand';
import PMEditor from './pages/PMEditor';

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
		path: '*',
		element: <Navigate to="/zustand" />,
	},
]);

export default function Router() {
	return <RouterProvider router={router} />;
}
