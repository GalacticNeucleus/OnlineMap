function MapLayer(obj) {
    this.Id = obj.Id;
    this.LayerId = obj.LayerId;
    this.Name = obj.Name;
    this.Queryable = obj.Queryable;
    this.Visible = obj.Visible;
    this.Fields = obj.Fields;
    this.ShowSubLayers = obj.ShowSubLayers;
    this.IsDefaultExtent = obj.IsDefaultExtent;
    this.Relationships = obj.Relationships;
}
function MapService(obj) {
    this.Url = obj.Url;
    this.LoadOrder = obj.LoadOrder;
    this.Layers = obj.Layers;
}