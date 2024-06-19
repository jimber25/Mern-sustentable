import React, { useState, useEffect } from "react";
import { Loader, Pagination } from "semantic-ui-react";
import { size, map } from "lodash";
import { Siteform } from "../../../../api";
import { SiteFormItem } from "../SiteFormItem";
import "./ListSiteForms.scss";

const siteFormController = new Siteform();

export function ListSiteForms(props) {
  const { reload, onReload } = props;
  const [siteforms, setSiteForms] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState();

  useEffect(() => {
    (async () => {
      try {
        const response = await siteFormController.getSiteForms({ page });
        if(response.docs){
          setSiteForms(response.docs);
        }else{
          setSiteForms([]);
        }
        
        // setSites(response.docs);
        // setPagination({
        //   limit: response.limit,
        //   page: response.page,
        //   pages: response.pages,
        //   total: response.total,
        // });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [page, reload]);

  const changePage = (_, data) => {
    setPage(data.activePage);
  };

  if (!siteforms) return <Loader active inline="centered" />;
  if (size(siteforms) === 0) return "No hay ningun formulario de sitio";

  return (
    <div className="list-sites">
      {map(siteforms, (siteForm) => (
        <SiteFormItem key={siteForm._id} siteForm={siteForm} onReload={onReload} />
      ))}

      <div className="list-sites__pagination">
        {/* <Pagination
          totalPages={pagination.pages}
          defaultActivePage={pagination.page}
          ellipsisItem={null}
          firstItem={null}
          lastItem={null}--
          onPageChange={changePage}
        /> */}
      </div>
    </div>
  );
}
