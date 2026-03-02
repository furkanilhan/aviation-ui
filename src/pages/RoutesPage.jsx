import { useState, useEffect } from 'react';
import {
  Select, DatePicker, Button, Card, List,
  Typography, Drawer, Steps, Tag, message, Space
} from 'antd';
import { SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import { searchRoutes, getLocationsForRoute } from '../api/routeApi';
import RouteMap from '../components/RouteMap';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TYPE_COLORS = {
  FLIGHT: 'blue',
  BUS: 'green',
  SUBWAY: 'orange',
  UBER: 'purple',
};

const TYPE_ICONS = {
  FLIGHT: '✈',
  BUS: '🚌',
  SUBWAY: '🚇',
  UBER: '🚗',
};

const RoutesPage = () => {
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [originId, setOriginId] = useState(null);
  const [destinationId, setDestinationId] = useState(null);
  const [date, setDate] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getLocationsForRoute()
      .then(res => setLocations(res.data))
      .catch(() => messageApi.error('Failed to fetch locations'));
  }, [messageApi]);

  const handleSearch = async () => {
    if (!originId || !destinationId || !date) {
      messageApi.warning('Please select origin, destination and date');
      return;
    }
    if (originId === destinationId) {
      messageApi.warning('Origin and destination cannot be the same');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await searchRoutes(originId, destinationId, formattedDate);
      setRoutes(response.data);
    } catch {
      messageApi.error('Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (route) => {
    setSelectedRoute(route);
    setDrawerOpen(true);
  };

  const getRouteLabel = (route) => {
    const parts = [];
    if (route.beforeFlight) parts.push(route.beforeFlight.originLocation.name);
    parts.push(route.flight.originLocation.name);
    parts.push(route.flight.destinationLocation.name);
    if (route.afterFlight) parts.push(route.afterFlight.destinationLocation.name);
    return parts.join(' → ');
  };

  const getRouteVia = (route) => {
    return `via ${route.flight.originLocation.locationCode} → ${route.flight.destinationLocation.locationCode}`;
};

  const locationOptions = locations.map(loc => ({
    label: `${loc.name} (${loc.locationCode})`,
    value: loc.id,
  }));

  const getStepsItems = (route) => {
    const items = [];

    if (route.beforeFlight) {
      items.push({
        title: route.beforeFlight.originLocation.name,
        content: (
          <Tag color={TYPE_COLORS[route.beforeFlight.transportationType]}>
            {TYPE_ICONS[route.beforeFlight.transportationType]}{' '}
            {route.beforeFlight.transportationType}
          </Tag>
        ),
      });
    }

    items.push({
      title: route.flight.originLocation.name,
      content: (
        <Tag color={TYPE_COLORS.FLIGHT}>
          {TYPE_ICONS.FLIGHT} FLIGHT
        </Tag>
      ),
    });

    items.push({
      title: route.flight.destinationLocation.name,
      content: route.afterFlight ? (
        <Tag color={TYPE_COLORS[route.afterFlight.transportationType]}>
          {TYPE_ICONS[route.afterFlight.transportationType]}{' '}
          {route.afterFlight.transportationType}
        </Tag>
      ) : null,
    });

    if (route.afterFlight) {
      items.push({
        title: route.afterFlight.destinationLocation.name,
        content: null,
      });
    }

    return items;
  };

  return (
    <>
      {contextHolder}
      <Title level={4}>Search Routes</Title>

      {/* Search Bar */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap size="middle">
          <div>
            <Text strong>Origin</Text>
            <br />
            <Select
              style={{ width: 220 }}
              options={locationOptions}
              placeholder="Select origin"
              value={originId}
              onChange={setOriginId}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
          <div>
            <Text strong>Destination</Text>
            <br />
            <Select
              style={{ width: 220 }}
              options={locationOptions}
              placeholder="Select destination"
              value={destinationId}
              onChange={setDestinationId}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
          <div>
            <Text strong>Date</Text>
            <br />
            <DatePicker
              value={date}
              onChange={setDate}
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </div>
          <div style={{ paddingTop: 22 }}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              Search
            </Button>
          </div>
        </Space>
      </Card>

      {searched && (
        <Card title={`Available Routes (${routes.length})`}>
          {routes.length === 0 ? (
            <Text type="secondary">No routes found for the selected criteria.</Text>
          ) : (
            <List
              dataSource={routes}
              renderItem={(route, index) => (
                <List.Item
                  key={index}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openDrawer(route)}
                  extra={<SwapRightOutlined style={{ fontSize: 18, color: '#1890ff' }} />}
                >
                  <List.Item.Meta
                    title={getRouteLabel(route)}
                    description={getRouteVia(route)}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

      <Drawer
        title="Route Details"
        placement="right"
        size={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        >
        {selectedRoute && (
            <>
            <Steps
                orientation="vertical"
                items={getStepsItems(selectedRoute)}
                style={{ marginBottom: 24 }}
            />
            <Title level={5}>Route Map</Title>
            <RouteMap route={selectedRoute} />
            </>
        )}
      </Drawer>
    </>
  );
};

export default RoutesPage;