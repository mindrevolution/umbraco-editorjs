namespace Our.Umbraco.EditorJs.Models
{
    public class UploadResponse
    {
        public int success { get; set; }

        public UploadResponseFile file { get; set; }

        public UploadResponse(int success, string url, object udi)
        {
            this.success = success;

            if (success == 1)
            {
                this.file = new UploadResponseFile(url, udi);
            }
        }

        public UploadResponse(int success) : this(success, string.Empty, string.Empty) { }
    }

    public class UploadResponseFile
    {
        public string url { get; set; }

        public string udi { get; set; }

        public UploadResponseFile(string url, object udi)
        {
            this.url = url;
            this.udi = udi.ToString();
        }
    }
}
