import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MoviePayload } from '../types/movie';

const { Title, Paragraph } = Typography;

interface MovieFormPageProps {
  mode: 'create' | 'edit';
}

export function MovieFormPage({ mode }: MovieFormPageProps) {
  const [form] = Form.useForm<MoviePayload>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const movieId = Number(id);
      setLoading(true);
      movieService
        .getMovie(movieId)
        .then((movie) => {
          form.setFieldsValue({
            title: movie.title,
            genre: movie.genre ?? undefined,
            rating: movie.rating ?? undefined,
            posterUrl: movie.posterUrl ?? undefined
          });
        })
        .catch((error) => {
          console.error(error);
          message.error('Unable to load movie details.');
          navigate('/', { replace: true });
        })
        .finally(() => setLoading(false));
    }
  }, [form, id, mode, navigate]);

  const handleSubmit = async (values: MoviePayload) => {
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await movieService.createMovie(values);
        message.success('Movie added successfully');
      } else if (id) {
        await movieService.updateMovie(Number(id), values);
        message.success('Movie updated successfully');
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      message.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      className="movie-page-card"
      title={
        <Space align="center">
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {mode === 'create' ? 'Add Movie' : 'Edit Movie'}
          </Title>
        </Space>
      }
      loading={loading}
    >
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Provide the movie title (required) and optionally include genre, rating (1-5) and a poster
        image URL.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        className="movie-form"
        onFinish={handleSubmit}
        initialValues={{ rating: undefined }}
        disabled={loading}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Title is required.' },
            { max: 200, message: 'Keep the title under 200 characters.' }
          ]}
        >
          <Input placeholder="Movie title" />
        </Form.Item>

        <Form.Item
          label="Genre"
          name="genre"
          rules={[{ max: 100, message: 'Genre must be 100 characters or less.' }]}
        >
          <Input placeholder="e.g. Adventure, Drama" />
        </Form.Item>

        <Form.Item
          label="Rating"
          name="rating"
          extra="Provide a value from 1 (worst) to 5 (best)."
        >
          <InputNumber min={1} max={5} style={{ width: '100%' }} placeholder="1 - 5" />
        </Form.Item>

        <Form.Item
          label="Poster URL"
          name="posterUrl"
          rules={[{ type: 'url', warningOnly: true, message: 'Please enter a valid URL.' }]}
        >
          <Input placeholder="https://example.com/poster.jpg" />
        </Form.Item>

        <Form.Item>
          <div className="movie-form-actions">
            <Button onClick={() => navigate('/')}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
              {mode === 'create' ? 'Create Movie' : 'Save Changes'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default MovieFormPage;
