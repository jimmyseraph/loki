import { LoadingOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export enum ReportStatus {
    FINISHED,
    RUNNING,
}

export function statusTag(status: number|undefined) {
    switch(status) {
        case ReportStatus.FINISHED: 
            return (
                <Tag color='success'>Finished</Tag>
            );
        case ReportStatus.RUNNING: 
            return (
                <Tag color='volcano' icon={<LoadingOutlined />}>Running</Tag>
            );
        default:
            return (
                <Tag color='default'>Unknown</Tag>
            );
    }
}