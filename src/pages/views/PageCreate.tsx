import { getAttributesAfterFileAttributesUpdate } from "@saleor/attributes/utils/data";
import {
  handleUploadMultipleFiles,
  prepareAttributesInput
} from "@saleor/attributes/utils/handlers";
import { AttributeInput } from "@saleor/components/Attributes";
import { WindowTitle } from "@saleor/components/WindowTitle";
import {
  DEFAULT_INITIAL_SEARCH_DATA,
  VALUES_PAGINATE_BY
} from "@saleor/config";
import { useFileUploadMutation } from "@saleor/files/mutations";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import usePageSearch from "@saleor/searches/usePageSearch";
import usePageTypeSearch from "@saleor/searches/usePageTypeSearch";
import useProductSearch from "@saleor/searches/useProductSearch";
import createAttributeValueSearchHandler from "@saleor/utils/handlers/attributeValueSearchHandler";
import createMetadataCreateHandler from "@saleor/utils/handlers/metadataCreateHandler";
import { mapEdgesToItems } from "@saleor/utils/maps";
import {
  useMetadataUpdate,
  usePrivateMetadataUpdate
} from "@saleor/utils/metadata/updateMetadata";
import { getParsedDataForJsonStringField } from "@saleor/utils/richText/misc";
import React from "react";
import { useIntl } from "react-intl";

import PageDetailsPage from "../components/PageDetailsPage";
import { PageSubmitData } from "../components/PageDetailsPage/form";
import { TypedPageCreate } from "../mutations";
import { usePageTypeQuery } from "../queries";
import { PageCreate as PageCreateData } from "../types/PageCreate";
import {
  pageCreateUrl,
  pageListUrl,
  pageUrl,
  PageUrlQueryParams
} from "../urls";

export interface PageCreateProps {
  id: string;
  params: PageUrlQueryParams;
}

export const PageCreate: React.FC<PageCreateProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();
  const [updateMetadata] = useMetadataUpdate({});
  const [updatePrivateMetadata] = usePrivateMetadataUpdate({});

  const [selectedPageTypeId, setSelectedPageTypeId] = React.useState<string>();

  const {
    loadMore: loadMorePageTypes,
    search: searchPageTypes,
    result: searchPageTypesOpts
  } = usePageTypeSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const {
    loadMore: loadMorePages,
    search: searchPages,
    result: searchPagesOpts
  } = usePageSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const {
    loadMore: loadMoreProducts,
    search: searchProducts,
    result: searchProductsOpts
  } = useProductSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const {
    loadMore: loadMoreAttributeValues,
    search: searchAttributeValues,
    result: searchAttributeValuesOpts
  } = createAttributeValueSearchHandler(DEFAULT_INITIAL_SEARCH_DATA);

  const { data: selectedPageType } = usePageTypeQuery({
    variables: {
      id: selectedPageTypeId,
      firstValues: VALUES_PAGINATE_BY
    },
    skip: !selectedPageTypeId
  });

  const attributeValues = mapEdgesToItems(
    searchAttributeValuesOpts?.data?.attribute.choices
  );

  const [uploadFile, uploadFileOpts] = useFileUploadMutation({});

  const handlePageCreate = (data: PageCreateData) => {
    if (data.pageCreate.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage({
          defaultMessage: "Successfully created new page"
        })
      });
      navigate(pageUrl(data.pageCreate.page.id));
    }
  };

  const handleAssignAttributeReferenceClick = (attribute: AttributeInput) =>
    navigate(
      pageCreateUrl({
        action: "assign-attribute-value",
        id: attribute.id
      })
    );

  const fetchMorePageTypes = {
    hasMore: searchPageTypesOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchPageTypesOpts.loading,
    onFetchMore: loadMorePageTypes
  };
  const fetchMoreReferencePages = {
    hasMore: searchPagesOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchPagesOpts.loading,
    onFetchMore: loadMorePages
  };
  const fetchMoreReferenceProducts = {
    hasMore: searchProductsOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchProductsOpts.loading,
    onFetchMore: loadMoreProducts
  };
  const fetchMoreAttributeValues = {
    hasMore: !!searchAttributeValuesOpts.data?.attribute?.choices?.pageInfo
      ?.hasNextPage,
    loading: !!searchAttributeValuesOpts.loading,
    onFetchMore: loadMoreAttributeValues
  };

  return (
    <TypedPageCreate onCompleted={handlePageCreate}>
      {(pageCreate, pageCreateOpts) => {
        const handleCreate = async (formData: PageSubmitData) => {
          const uploadFilesResult = await handleUploadMultipleFiles(
            formData.attributesWithNewFileValue,
            variables => uploadFile({ variables })
          );

          const updatedFileAttributes = getAttributesAfterFileAttributesUpdate(
            formData.attributesWithNewFileValue,
            uploadFilesResult
          );

          const result = await pageCreate({
            variables: {
              input: {
                attributes: prepareAttributesInput({
                  attributes: formData.attributes,
                  updatedFileAttributes
                }),
                content: getParsedDataForJsonStringField(formData.content),
                isPublished: formData.isPublished,
                pageType: formData.pageType?.id,
                publicationDate: formData.publicationDate,
                seo: {
                  description: formData.seoDescription,
                  title: formData.seoTitle
                },
                slug: formData.slug === "" ? null : formData.slug,
                title: formData.title
              }
            }
          });

          return {
            id: result.data.pageCreate.page?.id || null,
            errors: result.data?.pageCreate?.errors
          };
        };

        const handleSubmit = createMetadataCreateHandler(
          handleCreate,
          updateMetadata,
          updatePrivateMetadata
        );

        return (
          <>
            <WindowTitle
              title={intl.formatMessage({
                defaultMessage: "Create Page",
                description: "header"
              })}
            />
            <PageDetailsPage
              loading={pageCreateOpts.loading || uploadFileOpts.loading}
              errors={pageCreateOpts.data?.pageCreate.errors || []}
              saveButtonBarState={pageCreateOpts.status}
              page={null}
              attributeValues={attributeValues}
              pageTypes={mapEdgesToItems(searchPageTypesOpts?.data?.search)}
              onBack={() => navigate(pageListUrl())}
              onRemove={() => undefined}
              onSubmit={handleSubmit}
              fetchPageTypes={searchPageTypes}
              fetchMorePageTypes={fetchMorePageTypes}
              assignReferencesAttributeId={
                params.action === "assign-attribute-value" && params.id
              }
              onAssignReferencesClick={handleAssignAttributeReferenceClick}
              referencePages={mapEdgesToItems(searchPagesOpts?.data?.search)}
              referenceProducts={mapEdgesToItems(
                searchProductsOpts?.data?.search
              )}
              fetchReferencePages={searchPages}
              fetchMoreReferencePages={fetchMoreReferencePages}
              fetchReferenceProducts={searchProducts}
              fetchMoreReferenceProducts={fetchMoreReferenceProducts}
              fetchAttributeValues={searchAttributeValues}
              fetchMoreAttributeValues={fetchMoreAttributeValues}
              onCloseDialog={() => navigate(pageCreateUrl())}
              selectedPageType={selectedPageType?.pageType}
              onSelectPageType={id => setSelectedPageTypeId(id)}
            />
          </>
        );
      }}
    </TypedPageCreate>
  );
};
PageCreate.displayName = "PageCreate";
export default PageCreate;
