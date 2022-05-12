import { Pageable } from "./Pageable";
import { Page } from "./Page";
import { Identifiable } from "./Identifiable";
/**
 * {@link IDataSource} provides an abstract way to retrieve data from various sources
 */
export interface IDataSource<T> {
    /**
     * Returns a {@link Page} of entities meeting the paging restriction provided in the {@code Pageable} object.
     *
     * @param pageable the page settings to be used
     * @return a {@link Promise} emitting the page of entities
     */
    findAll(pageable: Pageable): Promise<Page<T>>;
    /**
     * Returns a {@link Page} of entities matching the search text and paging restriction provided in the {@code Pageable} object.
     *
     * @param searchText the text to search for entities for
     * @param pageable the page settings to be used
     * @return a {@link Promise} emitting the page of entities
     */
    search(searchText: string, pageable: Pageable): Promise<Page<T>>;
}
export interface IEditableDataSource<T extends Identifiable<string>> extends IDataSource<T> {
    /**
     * Creates a new entity if one does not already exist for the given id
     * @param entity to create if one does not already exist
     * @return a {@link Promise} containing the new entity or an error if an exception occurred
     */
    create(entity: T): Promise<T>;
    /**
     * Saves a given entity. Use the returned instance for further operations as the save operation might have changed the
     * entity instance completely.
     *
     * @param entity must not be {@literal null}.
     * @return a {@link Promise} emitting the saved entity.
     * @throws Error in case the given {@literal entity} is {@literal null}.
     */
    save(entity: T): Promise<T>;
    /**
     * Retrieves an entity by its id.
     *
     * @param identity must not be {@literal null}.
     * @return a {@link Promise} emitting the entity with the given id or {@link Promise#empty()} if none found.
     * @throws IllegalArgumentException in case the given {@literal identity} is {@literal null}.
     */
    findByIdentity(identity: string): Promise<T>;
    /**
     * Deletes the entity with the given id.
     *
     * @param identity must not be {@literal null}.
     * @return a {@link Promise} signaling when operation has completed.
     * @throws IllegalArgumentException in case the given {@literal identity} is {@literal null}.
     */
    deleteByIdentity(identity: string): Promise<void>;
    /**
     * Returns a {@link Page} of entities not in the ids list and meeting the paging restriction provided in the {@code Pageable} object.
     *
     * @param ids not to be returned in the Page
     * @param pageable the page settings to be used
     * @return a {@link Promise} emitting the page of entities
     */
    findByIdNotIn(ids: string[], pageable: Pageable): Promise<Page<Identifiable<string>>>;
}
export declare class DataSourceUtils {
    static instanceOfEditableDataSource(datasource: IDataSource<any> | IEditableDataSource<any>): datasource is IEditableDataSource<any>;
}
