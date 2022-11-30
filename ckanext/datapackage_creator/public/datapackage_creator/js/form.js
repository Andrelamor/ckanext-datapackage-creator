var app = new Vue({
    delimiters: ['[[', ']]'],
    el: '#vue-app',
    data: {
        package_id: '',
        resource_index: 1,
        resources: [
            {
                index: 1,
                file: null,
                show: true,
                fields: [],
                name: '',
                description: '',
                format: '',
                type: '',
                encoding: '',
                show_fields: true,
                inference: null,
                resource: null,
                current_field: [],
                has_error: false,
                error_summary: '',
                errors: {}
            }
        ],
        typeOptions: [
            'integer',
            'string',
            'number',
            'boolean',
            'object',
            'array',
            'date',
            'time',
            'datetime',
            'year',
            'yearmonth',
            'duration',
            'geopoint',
            'geojson',
            'any',
        ],
        defaultFormatOptions: [
            'default'
        ],
        stringFormatOptions: [
            'default',
            'email',
            'uri',
            'binary',
            'uuid'
        ],
        booleanOptions: [
            {
                'text': 'NÃO',
                'value': false
            },
            {
                'text': 'SIM',
                'value': true
            }
        ],
        typeOptions: [
            {
                text: 'Select type',
                value: ''
            },
            {
                text: 'Tabular Data Resource',
                value: 'tabular-data-resource'
            },
            {
                text: 'Data Resource',
                value: 'data-resource'
            }
        ]
    },
    mounted () {
        this.package_id = this.$refs.packageName.value
    },
    methods: {
        isDataResource(resource) {
            return resource.type === 'data-resource'
        },
        uploadFile(resource) {
            resource.file = this.$refs[`file_${resource.index}`][0].files[0]
            this.submitFile(resource)
        },
        submitFile(resource) {
            const formData = new FormData()
            formData.append('file', resource.file)
            const headers = { 'Content-Type': 'multipart/form-data' }
            axios.post("/datapackage-creator/inference", formData, { headers }).then((res) => {
                resource.inference = res.data
                resource.encoding = resource.inference.metadata.encoding
                resource.format = resource.inference.metadata.format
                resource.type = resource.inference.metadata.profile
                try {
                    resource.fields = res.data.metadata.schema.fields
                } catch (error) {
                    resource.fields = []
                }
            })
        },
        editMetadata(resource, field) {
            resource.current_field = field
            resource.show_fields = false
        },
        getFormatOptions(type) {
            if(type === 'string') {
                return this.stringFormatOptions
            } else {
                return this.defaultFormatOptions
            }
        },
        saveMetadata(resource, field) {
            resource.current_field = null
            resource.show_fields = true
        },
        saveResource(resource) {
            const formData = new FormData()
            formData.append('upload', resource.file)
            const headers = { 'Content-Type': 'multipart/form-data' }
            formData.append('package_id', this.package_id)
            formData.append('description', resource.description)
            formData.append('format', resource.format)
            formData.append('encoding', resource.encoding)
            formData.append('type', resource.type)
            formData.append('metadata', JSON.stringify(resource.fields))
            axios.post("/datapackage-creator/save-resource", formData, { headers }).then((res) => {
                resource.has_error = res.data.has_error
            })
        },
        deleteResource(resource_index) {
            this.resources = this.resources.filter(function(value, index, arr){
                return value.index != resource_index
            })
        },
        addResource() {
            this.resource_index += 1
            this.resources.push(
                {
                    index: this.resource_index,
                    show: true,
                    file: null,
                    fields: [],
                    name: '',
                    description: '',
                    format: '',
                    type: '',
                    encoding: '',
                    show_fields: true,
                    inference: null,
                    resource: null,
                    current_field: [],
                    has_error: false,
                    error_summary: '',
                    errors: {}
                }
            )
        },
        toggleResource(resource) {
            resource.show = !resource.show
        }
    }
})