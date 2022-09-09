import { Button, Col, Descriptions, Form, Input, Row, Switch } from 'antd';
import React, { useState } from 'react';
import { ScriptFormProps } from '../create';

const PlanForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
  const [form] = Form.useForm();

  const [enabled, setEnabled] = useState<boolean>(
    props.xmlNode?.getAttribute('enabled') === 'true',
  );

  const { xmlNode, onChange } = props;

  const handleEnabled = (
    checked: boolean,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setEnabled(checked);
  };

  const handleApply = () => {
    form.submit();
  };

  const handleFinish = () => {
    let label = form.getFieldValue('label');
    let enabled = form.getFieldValue('enabled');
    xmlNode?.setAttribute('label', label);
    xmlNode?.setAttribute('enabled', enabled.toString());
    if (onChange) {
      onChange(xmlNode as Element);
    }
  };

  return (
    <Form
      form={form}
      name="test_plan_form"
      autoComplete="off"
      layout="horizontal"
      onFinish={handleFinish}
    >
      <Row>
        <Col>
          <h3>Test Plan</h3>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '1.5em' }}>
        <Col span={10}>
          <Form.Item
            name="enabled"
            valuePropName="checked"
            initialValue={enabled}
          >
            <Switch
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
              onChange={handleEnabled}
            />
          </Form.Item>
          <Form.Item
            name="label"
            label="Label"
            initialValue={xmlNode?.getAttribute('label')}
            rules={[
              { required: true, message: 'Missing Label' },
              { max: 20, message: 'Length larger then 20' },
            ]}
          >
            <Input placeholder="test plan" disabled={!enabled} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: '1.5em' }}>
        <Col>
          <Button type="primary" onClick={handleApply}>
            Apply
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default PlanForm;
