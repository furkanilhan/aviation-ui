import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input,
  Space, Popconfirm, message, Typography
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getLocations, createLocation,
  updateLocation, deleteLocation
} from '../api/locationApi';

const { Title } = Typography;

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await getLocations();
      setLocations(response.data);
    } catch {
      messageApi.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    form.setFieldsValue(location);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingLocation) {
        await updateLocation(editingLocation.id, values);
        messageApi.success('Location updated');
      } else {
        await createLocation(values);
        messageApi.success('Location created');
      }
      setModalOpen(false);
      fetchLocations();
    } catch (error) {
      if (error?.errorFields) return;
      messageApi.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLocation(id);
      messageApi.success('Location deleted');
      fetchLocations();
    } catch (error) {
      messageApi.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Code', dataIndex: 'locationCode', key: 'locationCode' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this location?"
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
        <Title level={4} style={{ margin: 0 }}>Locations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Location
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={locations}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingLocation ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Country is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: 'City is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Location Code"
            name="locationCode"
            rules={[
              { required: true, message: 'Location code is required' },
              { min: 3, max: 10, message: 'Must be between 3-10 characters' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LocationsPage;