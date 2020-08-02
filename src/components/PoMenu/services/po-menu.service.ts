import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { PoMenuFilter } from "../po-menu-filter.interface";
import { PoMenuItemFiltered } from "../po-menu-item-filtered.interface";
import { of } from "rxjs";
/**
 * @docsPrivate
 *
 * @description
 *
 * Serviço que implementa a interface `PoMenuFilter`, utilizado para fazer requisições ao serviço informado pelo usuário,
 * caso for uma URL, no componente `po-menu`.
 */
//@Injectable()
export class PoMenuService implements PoMenuFilter {
  private _url!: string;

  get url(): string {
    return this._url;
  }

  configProperties(url: string) {
    this._url = url;
  }

  getFilteredData(
    search: string,
    params?: any
  ): Observable<Array<PoMenuItemFiltered>> {
    const filterParams = {
      search,
      ...params
    };

    return of(new Array<PoMenuItemFiltered>());
    // return this.http
    //     .get(this.url, { params: filterParams })
    //     .pipe(map((response: { items: Array<PoMenuItemFiltered> }) => response && response.items));
  }
}
