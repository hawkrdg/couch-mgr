import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout)); 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title           = 'couch-mgr';
  // serverURL       = 'https://hawkrdg.com/couch';
  serverURL       = 'some-couch-server';
  requestURL      = '';
  // currentAdmin    = 'hawkridge';
  currentAdmin    = 'some-admin-user';
  // currentPassword = 'shon\'ai';
  currentPassword = 'some-password';
  loginStatus     = 'Not Logged In...';
  currentDbList   = [];
  currentDb       = '';
  currentDocCnt   = 0;
  currentDelCnt   = 0;
  
  currentEditDoc  = 'Empty...'
  currentDDName   = 'Empty...';
  currentViewName = 'Empty...';
  includeDocs     = false;   
  canEdit         = true;
  canDestroy      = true;

  destroyCurDb    = false;
  showDestroyDb   = false;
  destroyCurDoc   = false;
  showDestroyDoc  = false;

  currentResult   = '';

  httpHeaders = new HttpHeaders(
    {
      'Content-Type':  'application/json'
    }
  ) 

  constructor(
    public http: HttpClient
  ) {}


  login = async () => {
    this.currentResult = `logging in \'${this.currentAdmin}\'`;
    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? this.serverURL + '/_session' : this.serverURL + '_session';
    console.log('login()');

    await firstValueFrom(this.http.post(this.requestURL, {name: this.currentAdmin, password: this.currentPassword}, 
                  {observe: 'body', responseType: 'json', withCredentials: true})).then(
      async d => {
        this.loginStatus = `logged In As \'${this.currentAdmin}\'`
        this.currentResult = `Logged in ${this.currentAdmin}:\n${JSON.stringify(d, null, 2)}`;
        this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? this.serverURL + '/_all_dbs' : this.serverURL + '_all_dbs';
        await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
          d => {
            this.currentDbList    = (d as any);
            this.currentResult    += `\nFetched database list for ${this.serverURL}\n`
            this.currentEditDoc   = 'Empty...'
            this.currentDDName    = 'Empty...';
            this.currentViewName  = 'Empty...';
            this.includeDocs      = false;   
            this.canEdit          = true;
          },
          e => {
            console.log(`ERROR FETCHING DATABASE LIST FOR \'${this.serverURL}\':\n${e.error.error} - ${e.error.reason}`);
            // this.currentResult = `ERROR LOGGING IN \'${this.currentAdmin}\':\n${JSON.stringify(e)}`;
            this.currentResult += `ERROR FETCHING DATABASE LIST FOR \'${this.serverURL}\':\n{e.error.error} - ${e.error.reason}`;
          }
        );
      },
      e => {
        console.log(`ERROR LOGGING IN \'${this.currentAdmin}\':\n{e.error.error} - ${e.error.reason}`);
        // this.currentResult = `ERROR LOGGING IN \'${this.currentAdmin}\':\n${JSON.stringify(e)}`;
        this.currentResult = `ERROR LOGGING IN \'${this.currentAdmin}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  logout = async () => {
    this.currentResult = `logging out \'${this.currentAdmin}\'`;
    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? this.serverURL + '/_session' : this.serverURL + '_session';
    console.log (`logout()`);

    await firstValueFrom(this.http.delete(this.requestURL,
                  {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.loginStatus = `Not logged In...'`
        this.currentResult    = `Logged out \'${this.currentAdmin}\':\n${JSON.stringify(d)}`;
        this.currentDbList    = [];
        this.currentDb        = '';
        this.currentDocCnt    = 0;
        this.currentDelCnt    = 0;
        this.currentEditDoc   = 'Empty...'
        this.currentDDName    = 'Empty...';
        this.currentViewName  = 'Empty...';
        this.includeDocs      = false;   
        this.canEdit          = true;
        this.canDestroy       = true;
  },
      e => {
        console.log(`ERROR LOGGING OUT \'${this.currentAdmin}\':\n${e.error.error} - ${e.error.reason}`);
        this.currentResult = `ERROR LOGGING OUT \'${this.currentAdmin}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  onSelectDb = async (ev) => {
    console.log('onSelectDb()...');
    this.currentDb = ev.options[0].value;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      this.serverURL + '/' + this.currentDb : this.serverURL + this.currentDb;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = `Fetched database info for ${this.currentDb}\n${JSON.stringify(d, null, 2)}`
        this.currentDocCnt = (d as any).doc_count;
        this.currentDelCnt = (d as any).doc_del_count;
      },
      e => {
        console.log(`ERROR FETCHING DATABASE INFO FOR \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`);
        this.currentResult = `ERROR FETCHING DATABASE INFO FOR \'${this.currentDb}\':\n$${e.error.error} - ${e.error.reason}}`;
      }
    );
  }

  refreshDbInfo = async () => {
    console.log('refreshDbInfo()...');

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      this.serverURL + '/' + this.currentDb : this.serverURL + this.currentDb;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = `Fetched database info for ${this.currentDb}\n${JSON.stringify(d, null, 2)}`
        this.currentDocCnt = (d as any).doc_count;
        this.currentDelCnt = (d as any).doc_del_count;
      },
      e => {
        console.log(`ERROR FETCHING DATABASE INFO FOR \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`);
        this.currentResult = `ERROR FETCHING DATABASE INFO FOR \'${this.currentDb}\':\n$${e.error.error} - ${e.error.reason}}`;
      }
    );
  }

  createDb = async () => {
    console.log('createDb()...');
    this.currentResult = `Creating database \'${this.currentDb}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      this.serverURL + '/' + this.currentDb : this.serverURL + this.currentDb;
    await firstValueFrom(this.http.put(this.requestURL, null, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      async d => {
        this.currentResult = `Created database \'${this.currentDb}\'\n${JSON.stringify(d, null, 2)}`

        this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? this.serverURL + '/_all_dbs' : this.serverURL + '_all_dbs';
        await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
          d => {
            this.currentDbList = (d as []);
            this.currentDb = '';
            this.currentResult += `\nRefresh database list...\n${JSON.stringify(d, null, 2)}`
          },
          e => {
            console.log(`ERROR FETCHING DATABASE LIST FOR \'${this.serverURL}\':\n${e.error.error} - ${e.error.reason}`);
            this.currentResult = `ERROR FETCHING DATABASE LIST FOR \'${this.serverURL}\':\n{e.error.error} - ${e.error.reason}`;
          }
        );
      },
      e => {
        console.log(`ERROR CREATING DATABASE \'${this.currentDb}\':\n{e.error.error} - ${e.error.reason}`);
        this.currentResult = `ERROR CREATING DATABASE \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}}`;
      }
    );
  }

  destroyDb = async () => {
    console.log('createDb()...');
    this.showDestroyDb = false;
    this.currentResult = `Destroying database \'${this.currentDb}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      this.serverURL + '/' + this.currentDb : this.serverURL + this.currentDb;
    await firstValueFrom(this.http.delete(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = `Destroyed database \'${this.currentDb}\'\n${JSON.stringify(d, null, 2)}`
        if (this.currentDbList.indexOf(this.currentDb) != -1) {
          this.currentDbList.splice(this.currentDbList.indexOf(this.currentDb), 1);
        }
        this.currentDb = '';
      },
      e => {
        console.log(`ERROR DESTROYING DATABASE \'${this.currentDb}\':\n{e.error.error} - ${e.error.reason}`);
        this.currentResult = `ERROR DESTROYING DATABASE \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  getAllDocs = async () => {
    console.log('getAllDocs()...');
    this.canEdit = true;
    this.currentResult = `Fetching all documents for \'${this.currentDb}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/_all_docs?include_docs=true` :
                      `${this.serverURL}${this.currentDb}/_all_docs?include_docs=true`;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentDocCnt = (d as any).total_rows;
        this.currentResult = JSON.stringify(d, null, 2);
        // (this.currentResult as any) = d;
        this.currentEditDoc = '_all_docs';
      },
      e => {
        console.log(`ERROR FETCHING DOCUMENTS FOR \'${this.currentDb}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING DOCUMENTS FOR \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  purgeDeleted = async () => {
    console.log('purgeDeleted()...');
    this.canEdit = false;
    this.currentResult = `Fetching _changes for \'${this.currentDb}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/_changes` :
                      `${this.serverURL}${this.currentDb}/_changes`;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      async d => {
        this.currentEditDoc = '_changes';
        const changes = (d as any).results;
        this.currentResult = `_changes...\n${JSON.stringify(changes, null, 2)}`;
        await delay(5000);
        this.currentResult = `_changes...\n${changes.map(r => 'id: '+r.id+'\ndeleted: '+r.deleted+'\n'+r.changes.map( c => 'rev: '+c.rev+'\n')+'\n')}`;
        delay(5000);
        const requestObj = {};
        changes.map(r => {
          const revArray = [];
          if (r.deleted) {
            r.changes.map(c => { 
              revArray.push(c.rev);
              requestObj[r.id] = revArray;
            });
          }
        });
        this.currentResult = `Purge requestObj:\n${JSON.stringify(requestObj, null, 2)}\n\nPurging database...`;
        
        this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                          `${this.serverURL}/${this.currentDb}/_purge` :
                          `${this.serverURL}${this.currentDb}/_purge`;
        await firstValueFrom(this.http.post(this.requestURL, requestObj, 
                          {observe: 'body', responseType: 'json', withCredentials: true})).then(
          d => {
            this.currentResult = JSON.stringify(d, null, 2);
            this.currentEditDoc = '_purge';
            this.canEdit = true;
          },
          e => {
            console.log(`ERROR PURGING DELETED DOCUMENTS FOR \'${this.currentDb}\':\n${JSON.stringify(e, null, 2)}`);
            this.currentResult = `ERROR PURGING DELETED DOCUMENTS FOR \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`;
          }
        );
      },
      e => {
        console.log(`ERROR FETCHING CHANGES FOR \'${this.currentDb}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING CHANGES FOR \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  getSecurityDoc = async () => {
    console.log('getSecurityDoc()...');
    this.canEdit = true;
    this.currentResult = `Fetching security document for \'${this.currentDb}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/_security` : `${this.serverURL}${this.currentDb}/_security`;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = JSON.stringify(d, null, 2);
        // (this.currentResult as any) = d;
        this.currentEditDoc = '_security';
        this.canEdit = true;
      },
      e => {
        console.log(`ERROR FETCHING SECURITY DOCUMENT FOR \'${this.currentDb}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING SECURITY DOCUMENT FOR \'${this.currentDb}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  getDesignDoc = async () => {
    console.log('getDesignDoc()...');
    this.canEdit = true;
    this.currentResult = `Fetching design document \'${this.currentDDName}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/_design/${this.currentDDName}` : 
                      `${this.serverURL}${this.currentDb}/_design/${this.currentDDName}`;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        console.log('DD: \n' + d)
        this.currentResult = JSON.stringify(d, null, 2);
        this.currentEditDoc = '_design/' + this.currentDDName;
        this.canEdit = true;
      },
      e => {
        console.log(`ERROR FETCHING DESIGN DOCUMENT \'${this.currentDDName}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING DESIGN DOCUMENT \'${this.currentDDName}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  getDataDoc = async () => {
    console.log('getDataDoc()...');
    this.canEdit = true;
    this.currentResult = `Fetching documnent \'${this.currentEditDoc}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/${this.currentEditDoc}` : 
                      `${this.serverURL}${this.currentDb}/${this.currentEditDoc}`;
                      console.log('getDataDoc() requestURL: ' + this.requestURL)
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = JSON.stringify(d, null, 2);
        this.canEdit = true;
      },
      e => {
        console.log(`ERROR FETCHING DOCUMENT \'${this.currentEditDoc}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING DOCUMENT \'${this.currentEditDoc}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  getView = async () => {
    console.log('getView()...');
    this.canEdit = false;
    this.currentResult = `Fetching view \'${this.currentViewName}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/_design/${this.currentDDName}/_view/${this.currentViewName}` : 
                      `${this.serverURL}${this.currentDb}/_design/${this.currentDDName}/_view/${this.currentViewName}`;
    this.requestURL = this.includeDocs ? this.requestURL + '?include_docs=true' : this.requestURL;
    await firstValueFrom(this.http.get(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        if (this.includeDocs) {
          this.currentResult = JSON.stringify((d as any).rows.map(r => r.doc), null, 2);
        } else {
          this.currentResult = JSON.stringify(d, null, 2);
        }
        this.currentEditDoc = `_design/${this.currentDDName}/${this.currentViewName}`;
      },
      e => {
        console.log(`ERROR FETCHING VIEW \'${this.currentViewName}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING ViEW \'${this.currentViewName}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  saveDoc = async () => {
    console.log('saveDoc()...');
    const saveDocData = JSON.parse(this.currentResult);
    this.currentEditDoc = saveDocData._id;
    console.log('docData: ' + saveDocData )

    this.currentResult = `Saving document \'${saveDocData._id}\'`;

    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/${saveDocData._id}` : 
                      `${this.serverURL}${this.currentDb}/${saveDocData._id}`;

    await firstValueFrom(this.http.put(this.requestURL, saveDocData, 
                        {headers: this.httpHeaders, observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = JSON.stringify(d, null, 2);
        this.canEdit = true;
      },
      e => {
        console.log(`ERROR SAVING DOCUMENT \'${saveDocData._id}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR SAVING DOCUMENT \'${saveDocData._id}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

  destroyDoc = async () => {
    console.log('destroyDoc()...');
    this.showDestroyDoc = false
    
    await this.getDataDoc();
    const delDocData = JSON.parse(this.currentResult);
    const queryString = `?rev=${delDocData._rev}`
    delay(5000);
    
    this.currentResult = `Destroying documnent \'${delDocData._id}\'`;
    this.requestURL = this.serverURL.charAt(this.serverURL.length - 1) != '/' ? 
                      `${this.serverURL}/${this.currentDb}/${delDocData._id}${queryString}` : 
                      `${this.serverURL}${this.currentDb}/${delDocData._id}${queryString}`;

    await firstValueFrom(this.http.delete(this.requestURL, {observe: 'body', responseType: 'json', withCredentials: true})).then(
      d => {
        this.currentResult = JSON.stringify(d, null, 2);
        this.canEdit = true;
      },
      e => {
        console.log(`ERROR FETCHING DOCUMENT \'${this.currentEditDoc}\':\n${JSON.stringify(e, null, 2)}`);
        this.currentResult = `ERROR FETCHING DOCUMENT \'${this.currentEditDoc}\':\n${e.error.error} - ${e.error.reason}`;
      }
    );
  }

}
