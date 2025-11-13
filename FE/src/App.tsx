import { Layout, Typography } from 'antd';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import MovieListPage from './pages/MovieListPage';
import MovieFormPage from './pages/MovieFormPage';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Link to="/">
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Movie Watchlist
          </Title>
        </Link>
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<MovieListPage />} />
          <Route path="/movies/new" element={<MovieFormPage mode="create" />} />
          <Route path="/movies/:id/edit" element={<MovieFormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
