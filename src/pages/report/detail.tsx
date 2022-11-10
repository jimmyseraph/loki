import { Col, message, Row } from 'antd';
import React from 'react';
import { ReportStatus } from './interface.d';
import ReportInfoCard from './report_info_card';
import ReportStatisticTable from './report_statistics_table';
import ReportCharts from './report_charts';
import { api, ReportInfoReply, ReportInfoVariables } from '@/api/Api4Config';
import { useQuery } from '@apollo/client';
import { history } from 'umi';

const ReportDetail: React.FC = (props: any) => {
  const { query } = props.location;
  const { loading, error, data, startPolling, stopPolling } = useQuery<
    { ReportInfo: ReportInfoReply },
    ReportInfoVariables
  >(api.getReportInfo, {
    variables: { id: query?.id },
  });

  if (error) {
    message.error(error.message);
    // if (error.message === 'auth failed') {
    //   history.push('/login');
    // }
  }

  if (data && data.ReportInfo.status === ReportStatus.RUNNING) {
    startPolling(5000);
  } else {
    stopPolling();
  }

  return (
    <div>
      <Row>
        <Col offset={8}>
          <h2>{data?.ReportInfo?.name}</h2>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <ReportInfoCard reportInfo={data?.ReportInfo} loading={loading} />
        </Col>
      </Row>
      <ReportStatisticTable
        reportId={query?.id}
        polling={
          data !== undefined && data.ReportInfo.status === ReportStatus.RUNNING
        }
      />
      <Row style={{ marginTop: '20px' }}>
        <ReportCharts
          reportId={query?.id}
          finished={
            !(
              data !== undefined &&
              data.ReportInfo.status === ReportStatus.RUNNING
            )
          }
        />
      </Row>
    </div>
  );
};

export default ReportDetail;
