import React from 'react'
import yaml from 'js-yaml'
import { autobind } from 'core-decorators'

@autobind
class Start extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      server: '',
      namespace: '',
      token: '',
      manifest: '',
    }
  }

  handleServerChange = e => {
    this.setState({server: e.target.value})
  }

  handleNamespaceChange = e => {
    this.setState({namespace: e.target.value})
  }

  handleTokenChange = e => {
    this.setState({token: e.target.value})
  }

  handleManifestChange = e => {
    this.setState({manifest: e.target.value})
  }

  handleSubmit = e => {
    e.preventDefault()
    this.fetchManifest()
  }

  fetchManifest = () => {
    fetch('https://anywhere.fabric8.io/' + this.state.manifest)
      .then(function (response) {
        return response.text()
      }).then(function (text) {
        try {
          return JSON.parse(text)
        } catch (e) {
          return yaml.safeLoad(text)
        }
      })
      .then(this.runCreateManifest)
      .catch(function (ex) {
        console.log('not json or yaml...', ex)
      })
  }

  runCreateManifest = manifest => {
    console.log(manifest)
    if (manifest.kind === 'List') {
      manifest.items.forEach(v => {
        this.runCreate(v)
      })
    } else {
      this.runCreate(manifest)
    }
  }

  runCreate = (obj) => {
    let relUrl = '/api'
    if (/\//.test(obj.apiVersion)) {
      relUrl += 's'
    }
    relUrl += '/' + obj.apiVersion + '/namespaces/' +
              this.state.namespace + '/' + obj.kind.toLowerCase() + 's'
    fetch(this.state.server + relUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.state.token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    }).then(response => {
      console.log(response.json())
    }).catch(e => {
      console.log(e)
    })
  }

  render () {
    return (
      <section id='contact'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-12 text-center'>
              <h2 className='section-heading'>Deploy stuff</h2>
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-12'>
              <form onSubmit={this.handleSubmit}>
                <div className='row'>
                  <div className='col-lg-12'>
                    <div className='form-group'>
                      <label htmlFor='server'>API server address</label>
                      <input type='url' className='form-control' value={this.state.server}
                        onChange={this.handleServerChange}
                        placeholder='https://api.server.com:8443 *'
                        id='server'
                        data-validation-required-message='Please enter your API server URL.' />
                      <p className='help-block text-danger'></p>
                    </div>
                    <div className='form-group'>
                      <label htmlFor='namespace'>Namespace</label>
                      <input type='text' className='form-control' value={this.state.namespace}
                        onChange={this.handleNamespaceChange}
                        placeholder='Your namespace *'
                        id='namespace'
                        data-validation-required-message='Please enter your namespace.' />
                      <p className='help-block text-danger'></p>
                    </div>
                    <div className='form-group'>
                      <label htmlFor='token'>Authentication token</label>
                      <input type='password' className='form-control' value={this.state.token}
                        onChange={this.handleTokenChange}
                        placeholder='Your token *'
                        id='token'
                        data-validation-required-message='Please enter your authentication token.' />
                      <p className='help-block text-danger'></p>
                    </div>
                    <div className='form-group'>
                      <label htmlFor='manifest'>Manifest file URL</label>
                      <input type='url' className='form-control' value={this.state.manifest}
                        onChange={this.handleManifestChange}
                        placeholder='https://yourserver.com/yourfile.yml *'
                        id='manifest' data-validation-required-message='Please enter your resources file URL.' />
                      <p className='help-block text-danger'></p>
                    </div>
                  </div>
                  <div className='clearfix'></div>
                  <div className='col-lg-12 text-center'>
                    <div id='success'></div>
                    <button type='submit' className='btn'>Go fabric8!</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default Start
