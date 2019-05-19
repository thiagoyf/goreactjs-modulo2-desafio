import React, { Component } from 'react';
import moment from 'moment';
import api from '../../services/api';

import logo from '../../assets/logo.png';

import { Container, Form } from './styles';

import CompareList from '../../components/CompareList';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
  };

  componentDidMount() {
    if (typeof Storage !== 'undefined') {
      const repositories = localStorage.getItem('repositories')
        ? JSON.parse(localStorage.getItem('repositories'))
        : [];
      this.setState({ repositories: [...repositories] });
    } else {
      console.log('Sorry! No Web Storage support');
    }
  }

  handleAddRepository = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { data: repository } = await api.get(`/repos/${this.state.repositoryInput}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      const repositories = [...this.state.repositories, repository];
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('repositories', JSON.stringify(repositories));
      } else {
        throw new Error('Sorry! No Web Storage support');
      }

      this.setState({
        repositoryInput: '',
        repositories: [...repositories],
        repositoryError: false,
      });
    } catch (err) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleRefreshRepository = async (repo) => {
    if (typeof Storage !== 'undefined') {
      const { data: repository } = await api.get(`/repos/${repo.owner.login}/${repo.name}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      const repositories = JSON.parse(localStorage.getItem('repositories'));

      const index = repositories.findIndex(r => r.id === repository.id);

      repositories.splice(index, 1, repository);

      localStorage.setItem('repositories', JSON.stringify(repositories));
      this.setState({
        repositories: [...repositories],
      });
    } else {
      console.log('Sorry! No Web Storage support');
    }
  };

  handleRemoveRepository = (id) => {
    if (typeof Storage !== 'undefined') {
      let repositories = JSON.parse(localStorage.getItem('repositories'));

      repositories = repositories.filter(repository => repository.id !== id);

      localStorage.setItem('repositories', JSON.stringify(repositories));
      this.setState({
        repositories: [...repositories],
      });
    } else {
      console.log('Sorry! No Web Storage support');
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="GitHub Compare" />

        <Form withError={this.state.repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {this.state.loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}
          </button>
        </Form>

        <CompareList
          repositories={this.state.repositories}
          removeRepository={this.handleRemoveRepository}
          refreshRepository={this.handleRefreshRepository}
        />
      </Container>
    );
  }
}
