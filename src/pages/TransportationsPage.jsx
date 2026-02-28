import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Select,
  Space, Popconfirm, message, Typography
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTransportations, createTransportation, updateTransportation, deleteTransportation } from '../api/transportationApi';
import { getLocations } from '../api/locationApi';

const { Title } = Typography;

const TRANSPORTATION_TYPES = ['FLIGHT', 'BUS', 'SUBWAY', 'UBER'];

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 7 },
];

const TransportationsPage = () => {
  const [transportations, setTransportations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, locRes] = await Promise.all([
        getTransportations(),
        getLocations()
      ]);
      setTransportations(transRes.data);
      setLocations(locRes.data);
    } catch {
      messageApi.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingTransportation(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (transportation) => {
    setEditingTransportation(transportation);
    form.setFieldsValue({
      originLocationId: transportation.originLocation.id,
      destinationLocationId: transportation.destinationLocation.id,
      transportationType: transportation.transportationType,
      operatingDays: transportation.operatingDays,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTransportation) {
        await updateTransportation(editingTransportation.id, values);
        messageApi.success('Transportation updated');
      } else {
        await createTransportation(values);
        messageApi.success('Transportation created');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      if (error?.errorFields) return;
      messageApi.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransportation(id);
      messageApi.success('Transportation deleted');
      fetchData();
    } catch (error) {
      messageApi.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const locationOptions = locations.map(loc => ({
    label: `${loc.name} (${loc.locationCode})`,
    value: loc.id,
  }));

  const columns = [
    {
      title: 'Origin',
      key: 'origin',
      render: (_, record) =>
        `${record.originLocation.name} (${record.originLocation.locationCode})`
    },
    {
      title: 'Destination',
      key: 'destination',
      render: (_, record) =>
        `${record.destinationLocation.name} (${record.destinationLocation.locationCode})`
    },
    { title: 'Type', dataIndex: 'transportationType', key: 'transportationType' },
    {
      title: 'Operating Days',
      key: 'operatingDays',
      render: (_, record) =>
        record.operatingDays
          .sort((a, b) => a - b)
          .map(d => DAYS.find(day => day.value === d)?.label)
          .join(', ')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this transportation?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Transportations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Transportation
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={transportations}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingTransportation ? 'Edit Transportation' : 'Add Transportation'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingTransportation ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Origin Location"
            name="originLocationId"
            rules={[{ required: true, message: 'Origin is required' }]}
          >
            <Select options={locationOptions} placeholder="Select origin" />
          </Form.Item>
          <Form.Item
            label="Destination Location"
            name="destinationLocationId"
            rules={[{ required: true, message: 'Destination is required' }]}
          >
            <Select options={locationOptions} placeholder="Select destination" />
          </Form.Item>
          <Form.Item
            label="Transportation Type"
            name="transportationType"
            rules={[{ required: true, message: 'Type is required' }]}
          >
            <Select
              options={TRANSPORTATION_TYPES.map(t => ({ label: t, value: t }))}
              placeholder="Select type"
            />
          </Form.Item>
          <Form.Item
            label="Operating Days"
            name="operatingDays"
            rules={[{ required: true, message: 'Operating days is required' }]}
          >
            <Select
              mode="multiple"
              options={DAYS}
              placeholder="Select operating days"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TransportationsPage;