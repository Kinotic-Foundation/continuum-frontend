import { Identifiable } from './Identifiable';
import { Page } from './Page';
import { Pageable } from './Pageable';
import { IEditableDataSource } from "./IDataSource";
export interface ICrudServiceProxy<T extends Identifiable<string>> extends IEditableDataSource<T> {
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
    /**s
     * Returns the number of entities available.
     *
     * @return a {@link Promise} emitting the number of entities.
     */
    count(): Promise<number>;
    /**
     * Deletes the entity with the given id.
     *
     * @param identity must not be {@literal null}.
     * @return a {@link Promise} signaling when operation has completed.
     * @throws IllegalArgumentException in case the given {@literal identity} is {@literal null}.
     */
    deleteByIdentity(identity: string): Promise<void>;
    /**
     * Returns a {@link Page} of entities meeting the paging restriction provided in the {@code Pageable} object.
     *
     * @param pageable the page settings to be used
     * @return a {@link Promise} emitting the page of entities
     */
    findAll(pageable: Pageable): Promise<Page<T>>;
    /**
     * Returns a {@link Page} of entities not in the ids list and meeting the paging restriction provided in the {@code Pageable} object.
     *
     * @param ids not to be returned in the Page
     * @param pageable the page settings to be used
     * @return a {@link Promise} emitting the page of entities
     */
    findByIdNotIn(ids: string[], pageable: Pageable): Promise<Page<Identifiable<string>>>;
    /**
     * Returns a {@link Page} of entities matching the search text and paging restriction provided in the {@code Pageable} object.
     *
     * @param searchText the text to search for entities for
     * @param pageable the page settings to be used
     * @return a {@link Promise} emitting the page of entities
     */
    search(searchText: string, pageable: Pageable): Promise<Page<T>>;
}
