import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Empty,
  Input,
  Rate,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd';
import { FileImageOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { Movie } from '../types/movie';

const { Title, Text } = Typography;
const { Search } = Input;

export function MovieListPage() {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'title' | 'rating'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await movieService.getMovies({
        search: searchTerm,
        genre: genreFilter,
        sortBy,
        sortDirection
      });
      setMovies(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to load movies. Please ensure the API is running.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, genreFilter, sortBy, sortDirection]);

  useEffect(() => {
    void fetchMovies();
  }, [fetchMovies]);

  const genreOptions = useMemo(() => {
    const values = new Set<string>();
    movies.forEach((movie) => {
      if (movie.genre) {
        values.add(movie.genre);
      }
    });
    if (genreFilter) {
      values.add(genreFilter);
    }
    return Array.from(values).map((value) => ({ label: value, value }));
  }, [movies, genreFilter]);

  const confirmDelete = (movie: Movie) => {
    console.log('Delete button clicked for movie:', movie);
    modal.confirm({
      title: `Delete "${movie.title}"?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        console.log('Confirming delete for movie ID:', movie.id);
        try {
          await movieService.deleteMovie(movie.id);
          message.success('Movie removed');
          void fetchMovies();
        } catch (err) {
          console.error('Delete error:', err);
          message.error('Failed to delete movie');
        }
      }
    });
  };

  const columns: ColumnsType<Movie> = [
    {
      title: 'Poster',
      dataIndex: 'posterUrl',
      key: 'poster',
      width: 120,
      render: (_, record) =>
        record.posterUrl ? (
          <img
            src={record.posterUrl}
            alt={record.title}
            className="poster-thumb"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="poster-placeholder">
            <FileImageOutlined />
          </div>
        )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.title}</Text>
          {record.genre && <Tag color="blue">{record.genre}</Tag>}
          <Text type="secondary">
            Added {new Date(record.createdAt).toLocaleDateString()}
          </Text>
        </Space>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 180,
      render: (rating: number | null | undefined) =>
        rating ? (
          <Rate disabled allowHalf={false} value={rating} />
        ) : (
          <Tag color="gray">Not rated</Tag>
        )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/movies/${record.id}/edit`)}>
            Edit
          </Button>
          <Button 
            danger 
            type="link" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              confirmDelete(record);
            }}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card className="movie-page-card" title={<Title level={3}>Movie List</Title>}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/movies/new')}>
          Add Movie
        </Button>
      </Space>

      <div className="movie-list-actions">
        <Search
          placeholder="Search by title"
          allowClear
          enterButton="Search"
          onSearch={(value) => setSearchTerm(value.trim())}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.value === '') {
              setSearchTerm('');
            }
          }}
        />

        <Select<string>
          placeholder="Filter by genre"
          allowClear
          options={genreOptions}
          value={genreFilter}
          showSearch
          optionFilterProp="label"
          onChange={(value) => setGenreFilter(value ?? undefined)}
        />

        <Select<string>
          value={`${sortBy}-${sortDirection}`}
          onChange={(value) => {
            const [field, direction] = value.split('-') as ['title' | 'rating', 'asc' | 'desc'];
            setSortBy(field);
            setSortDirection(direction);
          }}
          options={[
            { label: 'Title (A → Z)', value: 'title-asc' },
            { label: 'Title (Z → A)', value: 'title-desc' },
            { label: 'Rating (High → Low)', value: 'rating-desc' },
            { label: 'Rating (Low → High)', value: 'rating-asc' }
          ]}
        />
      </div>

      {error && (
        <Card size="small" style={{ marginBottom: 16 }} type="inner">
          <Text type="danger">{error}</Text>
        </Card>
      )}

      <Table<Movie>
        rowKey="id"
        columns={columns}
        dataSource={movies}
        loading={loading}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        locale={{
          emptyText: <Empty description="No movies found. Try adjusting your filters." />
        }}
      />
    </Card>
  );
}

export default MovieListPage;
