import { Card, Descriptions, Spin } from 'antd';
import { statusTag } from './interface.d';
import { ReportInfoReply } from '@/api/Api4Config';

interface ReportInfoCardProps {
  reportInfo?: ReportInfoReply;
  loading?: boolean;
}

const ReportInfoCard: React.FC<ReportInfoCardProps> = (
  props: ReportInfoCardProps,
) => {
  return (
    <Spin tip="Collecting..." spinning={props.loading}>
      <Card style={{ width: '100%' }}>
        <Descriptions
          title="基本信息"
          bordered
          style={{ width: '100%' }}
          column={2}
        >
          <Descriptions.Item label="测试开始时间">
            {props?.reportInfo?.startTime}
          </Descriptions.Item>
          <Descriptions.Item label="测试结束时间">
            {props?.reportInfo?.endTime}
          </Descriptions.Item>
          <Descriptions.Item label="测试总耗时">
            {props?.reportInfo?.duration}
          </Descriptions.Item>
          <Descriptions.Item label="运行脚本">
            {props?.reportInfo?.scriptName}
          </Descriptions.Item>
          <Descriptions.Item label="线程数">
            {props?.reportInfo?.threads}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {statusTag(props?.reportInfo?.status)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Spin>
  );
};

export default ReportInfoCard;
