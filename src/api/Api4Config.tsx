import { gql } from '@apollo/client';

export interface SignOnReply {
  id: string;
  name: string;
  email: string;
  mobile: string;
  token: string;
}

export interface SignOnVariables {
  user: string;
  password: string;
}

export interface SignOffReply {
  success: boolean;
}

export interface ScriptListReply {
  id: string;
  name: string;
  creator: string;
  createTime: string;
  updateTime: string;
}

export interface ScriptListVariables {
  id?: string;
  name?: string;
  creator?: string;
  updateTimeStart?: string;
  updateTimeEnd?: string;
}

export interface ScriptDetailReply {
  id: string;
  name: string;
  creator: string;
  createTime: string;
  updateTime: string;
  script: string;
}

export interface ScriptDetailVariables {
  id: string;
}

export interface ScriptRemoveVariables {
  id: string;
}

export interface ScriptRemoveReply {
  success: boolean;
}

export interface ScriptDetailReply {
  id: string;
  name: string;
  creator: string;
  createTime: string;
  updateTime: string;
  script: string;
}

export interface ScriptDetailVariables {
  id: string;
}

export interface ScriptSaveReply {
  id: string;
}

export interface ScriptSaveVariables {
  id?: string;
  name: string;
  script: string;
}

export interface ReportListReply {
  id: string;
  name: string;
  status: number;
  creator: string;
  createTime: string;
}

export interface ReportListVariables {
  id?: string;
  name?: string;
  status?: number;
  creator?: string;
  createTimeStart?: string;
  createTimeEnd?: string;
}

export interface StartPilotReply {
  id: string;
}

export interface StartPilotVariables {
  name: string;
  script: string;
  duration: number;
  agents: AgentInfo[];
}

export interface AgentInfo {
  id: string;
  name: string;
  threads: number;
}

export interface AgentListReply {
  id: string;
  label: string;
  host: string;
  port: number;
  volume: number;
  status: number;
}

export interface ReportInfoReply {
  id: string;
  name: string;
  script: string;
  scriptName: string;
  duration: number;
  status: number;
  threads: number;
  startTime: string;
  endTime: string;
}

export interface ReportInfoVariables {
  id: string;
}

export interface ReportStatisticsReply {
  id: string;
  label: string;
  samplers: number;
  failures: number;
  average: number;
  min: number;
  max: number;
  ninty: number;
  ninty_five: number;
  ninty_nine: number;
  tps: number;
  recieved: number;
  sent: number;
  errors: ErrorStat[];
}

export interface ErrorStat {
  type: string;
  num: number;
}

export interface ReportStatisticsVariables {
  id: string;
}

export interface ReportChartsReply {
  response_times_over_time: ResponseTimesOverTime[];
  active_threads_over_time: ActiveThreadsOverTime[];
  bytes_throughput_over_time: BytesThroughputOverTime[];
  transactions_per_second: TransactionsPerSecond[];
}

export interface ResponseTimesOverTime {
  label: string;
  response_times: number;
  time: string;
}

export interface ActiveThreadsOverTime {
  active_threads: number;
  time: string;
}

export interface BytesThroughputOverTime {
  bytes: number;
  time: string;
}

export interface TransactionsPerSecond {
  label: string;
  transactions: number;
  time: string;
}

export interface ReportChartsVariables {
  id: string;
}

export interface ScriptDebugReply {
  message: string;
}

export interface ScriptDebugVariables {
  script: string;
}

export const api = {
  login: gql`
    query SignOn($user: String!, $password: String!) {
      SignOn(user: $user, password: $password) {
        id
        name
        email
        mobile
        token
      }
    }
  `,

  logout: gql`
    query SignOff {
      SignOff {
        success
      }
    }
  `,

  getScriptList: gql`
    query ScriptList(
      $id: String
      $name: String
      $creator: String
      $updateTimeStart: String
      $updateTimeEnd: String
    ) {
      ScriptList(
        id: $id
        name: $name
        creator: $creator
        updateTimeStart: $updateTimeStart
        updateTimeEnd: $updateTimeEnd
      ) {
        id
        name
        creator
        createTime
        updateTime
      }
    }
  `,

  getScriptDetail: gql`
    query ScriptDetail($id: String!) {
      ScriptDetail(id: $id) {
        id
        name
        creator
        createTime
        updateTime
        script
      }
    }
  `,

  saveScript: gql`
    mutation ScriptSave($scriptSaveRequest: ScriptSaveRequest!) {
      ScriptSave(scriptSaveRequest: $scriptSaveRequest) {
        id
      }
    }
  `,

  removeScript: gql`
    mutation ScriptRemove($id: String!) {
      ScriptRemove(id: $id) {
        success
      }
    }
  `,

  getReportList: gql`
    query ReportList($reportListRequest: ReportListRequest) {
      ReportList(reportListRequest: $reportListRequest) {
        id
        name
        status
        creator
        createTime
      }
    }
  `,

  getReportInfo: gql`
    query ReportInfo($id: String!) {
      ReportInfo(id: $id) {
        id
        name
        script
        scriptName
        duration
        status
        threads
        startTime
        endTime
      }
    }
  `,

  getReportStatistics: gql`
    query ReportStatistics($id: String!) {
      ReportStatistics(id: $id) {
        id
        label
        samplers
        failures
        average
        min
        max
        ninty
        ninty_five
        ninty_nine
        sent
        recieved
        tps
        errors {
          type
          num
        }
      }
    }
  `,

  startPilot: gql`
    query StartPilot($startPilotRequest: StartPilotRequest!) {
      StartPilot(startPilotRequest: $startPilotRequest) {
        id
      }
    }
  `,

  getAgentList: gql`
    query AgentList {
      AgentList {
        id
        label
        host
        port
        volume
        status
      }
    }
  `,

  getReportCharts: gql`
    query ReportCharts($id: String!) {
      ReportCharts(id: $id) {
        response_times_over_time {
          label
          response_times
          time
        }
        active_threads_over_time {
          active_threads
          time
        }
        bytes_throughput_over_time {
          bytes
          time
        }
        transactions_per_second {
          label
          transactions
          time
        }
      }
    }
  `,

  subscriptionDebug: gql`
    subscription ScriptDebug($script: String!) {
      ScriptDebug(script: $script) {
        message
      }
    }
  `,
};
