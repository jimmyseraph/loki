import { PieChartOutlined, ToolOutlined, PlayCircleOutlined, LineChartOutlined } from '@ant-design/icons';

export default {
    route: {
        path: '/dashboard',
        routes: [
            {
                key: '1',
                path: '/dashboard',
                name: 'Dashboard',
                icon: <PieChartOutlined />,
            },
            {
                key: '2',
                path: '/script',
                name: 'Script Manage',
                icon: <ToolOutlined />,
            },
            {
                key: '3',
                path: '/pilot',
                name: 'Pilot Lib',
                icon: <PlayCircleOutlined />,
            },
            {
                key: '4',
                path: '/report',
                name: 'Report',
                icon: <LineChartOutlined />,
            },
        ],
    },

}