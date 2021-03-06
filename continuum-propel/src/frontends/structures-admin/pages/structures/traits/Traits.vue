<template>
    <v-container fluid fill-height>
        <v-layout justify-center>
            <v-flex text-xs-center mr-3 >
                <v-data-table
                        :height="computedHeight"
                        :max-height="computedHeight"
                        :headers="headers"
                        :items="items"
                        :server-items-length="options.totalItems"
                        :options.sync="options"
                        :loading="loading"
                        :single-expand="true"
                        show-expand
                        dense
                        item-key="id"
                        loading-text="Loading... Please wait"
                        class="elevation-1"
                        @page-count="pageCount = $event"
                        :fixed-header=true
                        :footer-props="{
                          showFirstLastPage: true,
                          firstIcon: 'mdi-arrow-collapse-left',
                          lastIcon: 'mdi-arrow-collapse-right',
                          prevIcon: 'mdi-minus',
                          nextIcon: 'mdi-plus',
                          'items-per-page-options':options.rowsPerPageItems
                        }" >

                    <template v-slot:item.created="{ item }">
                        {{ formatDate(item.created) }}
                    </template>
                    <template v-slot:item.updated="{ item }">
                        {{ formatDate(item.updated) }}
                    </template>
                    <template v-slot:item.required="{ item }">
                        <v-icon small
                                class="mr-2"
                                title="Required">
                            {{ item.required ? "fas fa-check" : "" }}
                        </v-icon>
                    </template>
                    <template v-slot:item.modifiable="{ item }">
                        <v-icon small
                                class="mr-2"
                                title="Modifiable">
                            {{ item.modifiable ? "fas fa-check" : "" }}
                        </v-icon>
                    </template>
                    <template v-slot:item.unique="{ item }">
                        <v-icon small
                                class="mr-2"
                                title="Unique">
                            {{ item.unique ? "fas fa-check" : "" }}
                        </v-icon>
                    </template>
                    <template v-slot:item.operational="{ item }">
                        <v-icon small
                                class="mr-2"
                                title="Operational">
                            {{ item.operational ? "fas fa-check" : "" }}
                        </v-icon>
                    </template>
                    <template v-slot:item.action="{ item }" >
                        <v-icon small
                                class="mr-2"
                                @click="editItem(item)"
                                v-show="item.modifiable"
                                title="Edit" >
                          {{icons.edit}}
                        </v-icon>
                        <v-icon small
                                @click="deleteItem(item)"
                                v-show="item.modifiable"
                                title="Delete" >
                          {{icons.delete}}
                        </v-icon>
                    </template>

                    <template v-slot:no-data>
                        <div class="py-12" >
                            <v-btn color="primary" @click="getAll" v-show="!loading">No Data - Push To Search Again</v-btn>
                        </div>
                    </template>

                    <template v-slot:expanded-item="{ item }" >
                        <td :colspan="headers.length" class="pa-1">
                            <v-list >
                                <v-list-item>
                                    JS Schema : {{item.schema}}
                                </v-list-item>
                                <v-list-item>
                                    ES Schema : {{item.esSchema}}
                                </v-list-item>
                            </v-list>
                        </td>
                    </template>


                    <template v-slot:top>
                        <v-toolbar flat color="white">
                            <v-toolbar-title>Traits</v-toolbar-title>
                            <v-divider
                                    class="mx-4"
                                    inset
                                    vertical
                            ></v-divider>
                            <v-alert dense
                                     outlined
                                     type="error"
                                     style="margin: 0 auto; text-align: center"
                                     v-show="serverErrors.length > 0">
                                {{ serverErrors }}
                            </v-alert>
                            <v-spacer></v-spacer>
                            <v-dialog v-model="dialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition" >
                                <template v-slot:activator="{ on }">
                                    <v-btn color="primary" dark class="mb-2" v-on="on">New Trait</v-btn>
                                </template>
                                <v-card>

                                    <v-toolbar>
                                        <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
                                        <v-spacer></v-spacer>
                                        <v-toolbar-items>
                                            <v-btn icon @click="close">
                                                <v-icon>{{icons.close}}</v-icon>
                                            </v-btn>
                                        </v-toolbar-items>
                                    </v-toolbar>

                                    <v-app-bar dark fixed bottom color="primary" >
                                        <v-spacer></v-spacer>
                                        <v-spacer></v-spacer>
                                        <v-btn dark text @click="close">Cancel</v-btn>
                                        <v-btn dark text @click="save">Save</v-btn>
                                    </v-app-bar>

                                    <v-list two-line rounded style="margin-bottom: 3em;" >
                                        <v-subheader>Basic Information</v-subheader>
                                        <v-alert dense
                                                 outlined
                                                 type="error"
                                                 v-show="serverErrors.length > 0">
                                            {{ serverErrors }}
                                        </v-alert>
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-text-field v-model="editedItem.name" label="Trait Name" autofocus></v-text-field>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-text-field v-model="editedItem.schema" label="JS Schema"></v-text-field>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-text-field v-model="editedItem.esSchema" label="ES Schema"></v-text-field>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-text-field v-model="editedItem.describeTrait" label="Describe Trait"></v-text-field>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-switch v-model="editedItem.required"
                                                          class="ma-2"
                                                          label="Required"
                                                          messages="Makes field required on all input forms.">
                                                </v-switch>
                                                <v-switch v-model="editedItem.modifiable"
                                                          class="ma-2"
                                                          label="Modifiable"
                                                          messages="Should field be modifiable after creation, immutable information.">
                                                </v-switch>
                                                <v-switch v-model="editedItem.unique"
                                                          class="ma-2"
                                                          label="Unique"
                                                          messages="Should be a unique field in the index, so no others should exist with identical data; i.e. mac address. ">
                                                </v-switch>
                                                <v-switch v-model="editedItem.operational"
                                                          class="ma-2"
                                                          label="Operational"
                                                          messages="Field provides functional operations to be performed, will never be shown in a GUI; i.e. VPN IP address.">
                                                </v-switch>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                                </v-card>
                            </v-dialog>
                        </v-toolbar>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { ITraitManager } from "@/frontends/structures-admin/services"
import { Trait } from '@/frontends/structures-admin/pages/structures/traits/Trait'
import { inject } from 'inversify-props'
import {
  mdiPlus,
  mdiPencil,
  mdiDelete,
  mdiClose
} from '@mdi/js'

@Component({
    components: { },
    props: { }
})
export default class Traits extends Vue {

    @inject()
    private traitManager!: ITraitManager

    private computedHeight: number = (window.innerHeight - 225)

    public items: Trait[] = []
    public loading: boolean = true
    public finishedInitialLoad: boolean = false
    public dialog: boolean = false
    public editedIndex: number = -1
    public defaultItem: Trait = new Trait("","","","","",0,0,true,true,true,true,false,false)
    public editedItem: Trait = Object.assign({}, this.defaultItem)

    public serverErrors: string = ""

    public options: any = {
        mustSort: true,
        sortDesc: [false],
        page: 1,
        totalItems: 0,
        itemsPerPage: 10,
        sortBy: ["name"],
        rowsPerPageItems: [5,10,25,50,75,100,-1]
    }

    // NOTE: Cannot Sort on Fields that are set up for Full Text Search.
    public headers: any = [
        {text: 'Name',align: 'left',value: 'name'},
        { text: 'Description', value: 'describeTrait', sortable: false },
        // { text: 'JS Schema', value: 'schema', sortable: false },
        // { text: 'ES Schema', value: 'esSchema', sortable: false },
        // { text: 'Created', value: 'created' },
        // { text: 'Last Updated', value: 'updated' },
        { text: 'Required',align: 'center', value: 'required' },// should the GUI require a field to be filled out when looking at the item
        { text: 'Modifiable',align: 'center', value: 'modifiable' },// should this field be modifiable outside the system
        { text: 'Unique',align: 'center', value: 'unique' },// should be a unique field in the index, so no others should exist
        { text: 'Operational',align: 'center', value: 'operational' },
        { text: 'Actions', value: 'action', sortable: false }
      ]

    private icons = {
      close: mdiClose,
      add: mdiPlus,
      edit: mdiPencil,
      delete: mdiDelete
    }

    constructor() {
        super()
    }

    // Lifecycle hook
    public mounted() {
        this.getAll()
    }

    public beforeDestroy() {
    }

    @Watch('options')
    public watchPagination(value: any, oldValue: any){
        if(value.sortBy.length === 0){
            value.sortBy = ["name"]
            value.sortDesc = [true]
        }
        this.options = value
        if(this.finishedInitialLoad){
            this.getAll()
        }
    }

    @Watch('dialog')
    public watchDialog(value: boolean, oldValue: boolean){
        value || this.close()
    }

    public formatDate(timeInMills: number){
        let [date, time] = new Date(timeInMills).toLocaleString('en-US', {hour12: false}).split(', ')
        return date + " " + time
    }

    public getAll() {
        this.loading = true
        this.traitManager.getAll(this.options.itemsPerPage, this.options.page-1, this.options.sortBy[0], this.options.sortDesc[0]).then((returnedItems: any) => {
            this.loading = false
            this.options.totalItems = returnedItems.totalElements
            this.items = returnedItems.content

            if(!this.finishedInitialLoad){
                setTimeout(() => {
                    this.finishedInitialLoad = true
                }, 500)
            }

        })
        .catch((error: any) => {
            console.log(error.stack)
            this.serverErrors = error.message

            if(!this.finishedInitialLoad){
                setTimeout(() => {
                    this.finishedInitialLoad = true
                }, 500)
            }

        })
    }

    get formTitle () {
        return this.editedIndex === -1 ? 'New Trait' : 'Edit Trait'
    }

    public editItem(item: Trait) {
        this.editedIndex = this.items.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
    }

    public deleteItem(item: Trait) {
        const index = this.items.indexOf(item)
        if(confirm('Are you sure you want to Delete this Trait?')) {
            this.traitManager.delete(item.id).then((data) => {
                this.items.splice(index, 1)
                this.options.totalItems--
                if((this.options.totalItems/this.options.itemsPerPage) < this.options.page && this.options.page > 1){
                    this.options.page--
                    this.getAll()
                }
            }).catch((error: any) => {
                console.log(error.stack)
                this.serverErrors = error.message
            })
        }
    }

    public save() {
        // FIXME: add some JSON validation around the schema and esSchema
        this.traitManager.save(this.editedItem).then((item) => {
            if (this.editedIndex > -1) {
                Object.assign(this.items[this.editedIndex], item)
            } else {
                this.options.totalItems++
                this.items.push(item)
            }
            this.close()
        })
        .catch((error: any) => {
            console.log(error.stack)
            this.serverErrors = error.message
        })

    }

    public close () {
        this.dialog = false
        setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            this.serverErrors = ""
        }, 300)
    }

}
</script>

<style scoped>

</style>
